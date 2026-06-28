alter table public.matches
add column if not exists penalties_enabled boolean not null default false,
add column if not exists penalty_winner_team text null check (penalty_winner_team in ('home', 'away')),
add constraint matches_penalty_winner_requires_enabled check (
  penalty_winner_team is null or penalties_enabled
),
add constraint matches_penalty_winner_requires_draw check (
  penalty_winner_team is null or home_score = away_score
);

alter table public.predictions
add column if not exists penalty_winner_team text null check (penalty_winner_team in ('home', 'away')),
add constraint predictions_penalty_winner_requires_draw check (
  penalty_winner_team is null or home_score = away_score
);

create or replace function public.prediction_points(
  predicted_home integer,
  predicted_away integer,
  actual_home integer,
  actual_away integer,
  penalties_enabled boolean,
  predicted_penalty_winner text,
  actual_penalty_winner text
)
returns integer
language sql
immutable
as $$
  select case
    when not penalties_enabled then public.prediction_points(predicted_home, predicted_away, actual_home, actual_away)
    when predicted_home <> predicted_away then public.prediction_points(predicted_home, predicted_away, actual_home, actual_away)
    when actual_home <> actual_away then public.prediction_points(predicted_home, predicted_away, actual_home, actual_away)
    when predicted_home = actual_home
      and predicted_away = actual_away
      and predicted_penalty_winner is not null
      and predicted_penalty_winner = actual_penalty_winner then 4
    when predicted_home = actual_home and predicted_away = actual_away then 3
    when predicted_penalty_winner is not null and predicted_penalty_winner = actual_penalty_winner then 2
    else 1
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
  match_penalties_enabled boolean;
  actual_penalty_winner text;
begin
  perform set_config('app.scoring_update', 'on', true);

  select home_score, away_score, penalties_enabled, penalty_winner_team
  into actual_home, actual_away, match_penalties_enabled, actual_penalty_winner
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
    points = public.prediction_points(
      home_score,
      away_score,
      actual_home,
      actual_away,
      match_penalties_enabled,
      penalty_winner_team,
      actual_penalty_winner
    ),
    exact_score = (home_score = actual_home and away_score = actual_away)
  where match_id = target_match_id;
end;
$$;

create or replace function public.finish_match_with_result(
  target_match_id uuid,
  final_home_score integer,
  final_away_score integer,
  final_penalty_winner_team text default null
)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_match public.matches;
  match_penalties_enabled boolean;
  normalized_penalty_winner text;
begin
  if not public.is_admin() then
    raise exception 'Only admins can enter results';
  end if;

  if final_home_score < 0 or final_away_score < 0 then
    raise exception 'Scores must be zero or greater';
  end if;

  select penalties_enabled
  into match_penalties_enabled
  from public.matches
  where id = target_match_id;

  if match_penalties_enabled is null then
    raise exception 'Match not found';
  end if;

  normalized_penalty_winner = case
    when match_penalties_enabled and final_home_score = final_away_score then final_penalty_winner_team
    else null
  end;

  if match_penalties_enabled and final_home_score = final_away_score and normalized_penalty_winner is null then
    raise exception 'Penalty winner is required for drawn knockout results';
  end if;

  if normalized_penalty_winner is not null and normalized_penalty_winner not in ('home', 'away') then
    raise exception 'Penalty winner must be home or away';
  end if;

  update public.matches
  set
    home_score = final_home_score,
    away_score = final_away_score,
    penalty_winner_team = normalized_penalty_winner,
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
begin
  return public.finish_match_with_result(target_match_id, final_home_score, final_away_score, null::text);
end;
$$;

create or replace function public.prevent_prediction_after_kickoff()
returns trigger
language plpgsql
as $$
declare
  match_kickoff timestamptz;
  match_penalties_enabled boolean;
  is_scoring_update boolean;
begin
  is_scoring_update = coalesce(current_setting('app.scoring_update', true), '') = 'on';

  select kickoff_time, penalties_enabled
  into match_kickoff, match_penalties_enabled
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
    if new.home_score <> old.home_score
      or new.away_score <> old.away_score
      or new.penalty_winner_team is distinct from old.penalty_winner_team then
      raise exception 'Scoring updates cannot change predicted scores';
    end if;

    return new;
  end if;

  if new.home_score <> new.away_score or not match_penalties_enabled then
    new.penalty_winner_team = null;
  end if;

  if match_penalties_enabled and new.home_score = new.away_score and new.penalty_winner_team is null then
    raise exception 'Penalty winner is required for drawn knockout predictions';
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

create or replace view public.finished_prediction_details as
select
  pr.user_id,
  coalesce(nullif(p.username, ''), p.email) as display_name,
  pr.match_id,
  m.home_team,
  m.away_team,
  m.kickoff_time,
  pr.home_score as predicted_home_score,
  pr.away_score as predicted_away_score,
  pr.penalty_winner_team as predicted_penalty_winner_team,
  m.home_score as final_home_score,
  m.away_score as final_away_score,
  m.penalty_winner_team as final_penalty_winner_team,
  m.penalties_enabled,
  case
    when m.status = 'finished' and m.home_score is not null and m.away_score is not null then pr.points
    else null
  end as points,
  case
    when m.status = 'finished' and m.home_score is not null and m.away_score is not null then pr.exact_score
    else null
  end as exact_score,
  m.status as match_status
from public.predictions pr
join public.matches m on m.id = pr.match_id
join public.profiles p on p.id = pr.user_id
where m.status = 'finished'
  or m.kickoff_time <= now();

grant select on public.finished_prediction_details to authenticated;
grant execute on function public.finish_match_with_result(uuid, integer, integer) to authenticated;
grant execute on function public.finish_match_with_result(uuid, integer, integer, text) to authenticated;
