create extension if not exists pgcrypto;

create type public.user_role as enum ('user', 'admin');
create type public.match_status as enum ('scheduled', 'live', 'finished');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  home_team text not null check (char_length(trim(home_team)) > 0),
  away_team text not null check (char_length(trim(away_team)) > 0),
  kickoff_time timestamptz not null,
  status public.match_status not null default 'scheduled',
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finished_matches_have_scores check (
    status <> 'finished' or (home_score is not null and away_score is not null)
  )
);

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  points integer not null default 0 check (points >= 0),
  exact_score boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, user_id)
);

create index profiles_role_idx on public.profiles(role);
create index matches_kickoff_time_idx on public.matches(kickoff_time);
create index matches_status_idx on public.matches(status);
create index predictions_user_id_idx on public.predictions(user_id);
create index predictions_match_id_idx on public.predictions(match_id);
create index predictions_points_idx on public.predictions(points desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

create trigger predictions_set_updated_at
before update on public.predictions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'username', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.prediction_points(
  predicted_home integer,
  predicted_away integer,
  actual_home integer,
  actual_away integer
)
returns integer
language sql
immutable
as $$
  select case
    when predicted_home = actual_home and predicted_away = actual_away then 3
    when predicted_home = predicted_away and actual_home = actual_away then 1
    when predicted_home > predicted_away and actual_home > actual_away then 1
    when predicted_home < predicted_away and actual_home < actual_away then 1
    else 0
  end;
$$;

create or replace function public.recalculate_match_predictions(target_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actual_home integer;
  actual_away integer;
begin
  perform set_config('app.scoring_update', 'on', true);

  select home_score, away_score
  into actual_home, actual_away
  from public.matches
  where id = target_match_id and status = 'finished';

  if actual_home is null or actual_away is null then
    update public.predictions
    set points = 0, exact_score = false
    where match_id = target_match_id;
    return;
  end if;

  update public.predictions
  set
    points = public.prediction_points(home_score, away_score, actual_home, actual_away),
    exact_score = (home_score = actual_home and away_score = actual_away)
  where match_id = target_match_id;
end;
$$;

create or replace function public.finish_match_with_result(
  target_match_id uuid,
  final_home_score integer,
  final_away_score integer
)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_match public.matches;
begin
  if not public.is_admin() then
    raise exception 'Only admins can enter results';
  end if;

  if final_home_score < 0 or final_away_score < 0 then
    raise exception 'Scores must be zero or greater';
  end if;

  update public.matches
  set
    home_score = final_home_score,
    away_score = final_away_score,
    status = 'finished'
  where id = target_match_id
  returning * into saved_match;

  if saved_match.id is null then
    raise exception 'Match not found';
  end if;

  perform public.recalculate_match_predictions(target_match_id);
  return saved_match;
end;
$$;

create or replace function public.prevent_prediction_after_kickoff()
returns trigger
language plpgsql
as $$
declare
  match_kickoff timestamptz;
  is_scoring_update boolean;
begin
  is_scoring_update = coalesce(current_setting('app.scoring_update', true), '') = 'on';

  select kickoff_time
  into match_kickoff
  from public.matches
  where id = new.match_id;

  if match_kickoff is null then
    raise exception 'Match not found';
  end if;

  if now() >= match_kickoff and not public.is_admin() and not is_scoring_update then
    raise exception 'Predictions are locked after kickoff';
  end if;

  if tg_op = 'UPDATE' and new.user_id <> old.user_id then
    raise exception 'Prediction owner cannot be changed';
  end if;

  if tg_op = 'UPDATE' and new.match_id <> old.match_id then
    raise exception 'Prediction match cannot be changed';
  end if;

  if tg_op = 'UPDATE' and is_scoring_update then
    if new.home_score <> old.home_score or new.away_score <> old.away_score then
      raise exception 'Scoring updates cannot change predicted scores';
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.points = old.points;
    new.exact_score = old.exact_score;
  else
    new.points = 0;
    new.exact_score = false;
  end if;

  return new;
end;
$$;

create trigger predictions_prevent_after_kickoff
before insert or update on public.predictions
for each row execute function public.prevent_prediction_after_kickoff();

create or replace view public.leaderboard as
select
  p.id as user_id,
  coalesce(nullif(p.username, ''), p.email) as display_name,
  coalesce(sum(pr.points), 0)::integer as total_points,
  count(pr.id)::integer as prediction_count,
  count(pr.id) filter (where pr.exact_score)::integer as exact_score_count
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
group by p.id, p.username, p.email;

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;

create policy "Profiles are readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Authenticated users can read matches"
on public.matches for select
to authenticated
using (true);

create policy "Admins can insert matches"
on public.matches for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update matches"
on public.matches for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete matches"
on public.matches for delete
to authenticated
using (public.is_admin());

create policy "Users can read own predictions"
on public.predictions for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users can insert own predictions before kickoff"
on public.predictions for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.matches
    where matches.id = match_id
      and now() < matches.kickoff_time
  )
);

create policy "Users can update own predictions before kickoff"
on public.predictions for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.matches
    where matches.id = match_id
      and now() < matches.kickoff_time
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.matches
    where matches.id = match_id
      and now() < matches.kickoff_time
  )
);

create policy "Admins can manage predictions"
on public.predictions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.leaderboard to authenticated;
grant all on public.profiles to authenticated;
grant all on public.matches to authenticated;
grant all on public.predictions to authenticated;
revoke execute on function public.recalculate_match_predictions(uuid) from public, anon, authenticated;
grant execute on function public.finish_match_with_result(uuid, integer, integer) to authenticated;
