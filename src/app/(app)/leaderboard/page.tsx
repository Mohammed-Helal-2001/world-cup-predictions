import { EmptyState } from "@/components/EmptyState";
import { LeaderboardDetails } from "@/components/LeaderboardDetails";
import { requireUser } from "@/lib/auth";
import type { LeaderboardPredictionDetail, LeaderboardRow } from "@/lib/types";

export default async function LeaderboardPage() {
  const { supabase } = await requireUser();
  const [{ data: rows, error }, { data: details, error: detailsError }] = await Promise.all([
    supabase
      .from("leaderboard")
      .select("*")
      .order("total_points", { ascending: false })
      .order("exact_score_count", { ascending: false })
      .returns<LeaderboardRow[]>(),
    supabase
      .from("finished_prediction_details")
      .select("*")
      .order("kickoff_time", { ascending: false })
      .returns<LeaderboardPredictionDetail[]>()
  ]);

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <p className="eyebrow">Competition table</p>
        <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Leaderboard</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
          Ranked by total points, then exact scores. Select a competitor to review finished and locked prediction details.
        </p>
      </div>

      {error ? <p className="rounded-md bg-coral/10 p-3 text-sm text-coral">{error.message}</p> : null}
      {detailsError ? <p className="rounded-md bg-coral/10 p-3 text-sm text-coral">{detailsError.message}</p> : null}

      {rows?.length ? (
        <LeaderboardDetails rows={rows} details={details ?? []} />
      ) : (
        <EmptyState title="No leaderboard data" text="Scores appear after users submit predictions." />
      )}
    </div>
  );
}
