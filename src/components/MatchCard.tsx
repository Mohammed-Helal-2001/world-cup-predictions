import { CalendarDays, Goal, LockKeyhole, PencilLine } from "lucide-react";
import { formatDateTime, formatPenaltyWinner } from "@/lib/format";
import type { Match, Prediction } from "@/lib/types";
import { PredictionForm } from "@/components/PredictionForm";
import { StatusBadge } from "@/components/StatusBadge";

export function MatchCard({
  match,
  prediction,
  userId
}: {
  match: Match;
  prediction?: Prediction | null;
  userId: string;
}) {
  return (
    <article className="panel overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-pitch via-gold to-coral" />
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-ink/60">
              <CalendarDays size={15} />
              {formatDateTime(match.kickoff_time)}
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink">
              {match.home_team} <span className="text-ink/35">vs</span> {match.away_team}
            </h2>
          </div>
          <StatusBadge kickoffTime={match.kickoff_time} status={match.status} />
        </div>

        {match.status === "finished" ? (
          <div className="mt-4 rounded-md bg-field p-3 text-sm">
            Final result:{" "}
            <span className="font-bold">
              {match.home_score} - {match.away_score}
            </span>
          </div>
        ) : null}

        {prediction ? (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-line bg-white p-3 text-sm">
            <PencilLine size={16} className="text-pitch" />
            <span>Your prediction:</span>{" "}
            <span className="font-bold">
              {prediction.home_score} - {prediction.away_score}
            </span>
            {match.penalties_enabled && prediction.penalty_winner_team ? (
              <span className="text-ink/60">
                Pens: {formatPenaltyWinner(prediction.penalty_winner_team, match.home_team, match.away_team)}
              </span>
            ) : null}
            {match.status === "finished" ? (
              <span className="ml-2 text-pitch">({prediction.points} points)</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 rounded-md border border-line bg-field/70 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            {match.status === "finished" ? <Goal size={16} /> : <LockKeyhole size={16} />}
            Submit score prediction
          </div>
          <PredictionForm match={match} userId={userId} prediction={prediction} />
        </div>
      </div>
    </article>
  );
}
