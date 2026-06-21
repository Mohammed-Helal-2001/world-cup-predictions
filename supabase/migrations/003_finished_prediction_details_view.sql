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
  m.home_score as final_home_score,
  m.away_score as final_away_score,
  pr.points,
  pr.exact_score
from public.predictions pr
join public.matches m on m.id = pr.match_id
join public.profiles p on p.id = pr.user_id
where m.status = 'finished'
  and m.home_score is not null
  and m.away_score is not null;

grant select on public.finished_prediction_details to authenticated;
