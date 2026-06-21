import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import type { PredictionWithMatch } from "@/lib/types";

export default async function PredictionsPage() {
  const { supabase, user } = await requireUser();
  const { data: predictions, error } = await supabase
    .from("predictions")
    .select("*, matches(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<PredictionWithMatch[]>();

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <p className="eyebrow">Prediction history</p>
        <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">My Predictions</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">Review saved predictions, final results, and awarded points.</p>
      </div>

      {error ? <p className="rounded-md bg-coral/10 p-3 text-sm text-coral">{error.message}</p> : null}

      {predictions?.length ? (
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
          <div className="grid min-w-[720px] grid-cols-6 border-b border-line bg-field px-4 py-3 text-xs font-bold uppercase text-ink/60">
            <span>Match</span>
            <span>Kickoff</span>
            <span>Prediction</span>
            <span>Result</span>
            <span>Status</span>
            <span>Points</span>
          </div>
          <div className="overflow-x-auto">
            {predictions.map((prediction) => {
              const match = prediction.matches;
              return (
                <div key={prediction.id} className="grid min-w-[720px] grid-cols-6 items-center border-b border-line px-4 py-3 text-sm last:border-0">
                  <span className="font-semibold">
                    {match?.home_team} vs {match?.away_team}
                  </span>
                  <span>{match ? formatDateTime(match.kickoff_time) : "-"}</span>
                  <span>
                    {prediction.home_score} - {prediction.away_score}
                  </span>
                  <span>
                    {match?.status === "finished" ? `${match.home_score} - ${match.away_score}` : "-"}
                  </span>
                  <span>{match ? <StatusBadge kickoffTime={match.kickoff_time} status={match.status} /> : "-"}</span>
                  <span className="font-bold text-pitch">{prediction.points}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState title="No predictions saved" text="Open the matches page and save your first score prediction." />
      )}
    </div>
  );
}
