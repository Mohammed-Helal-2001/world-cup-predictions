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
