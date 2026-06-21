import { EmptyState } from "@/components/EmptyState";
import { MatchCard } from "@/components/MatchCard";
import { requireUser } from "@/lib/auth";
import type { Match, Prediction } from "@/lib/types";

export default async function MatchesPage() {
  const { supabase, user } = await requireUser();

  const [{ data: matches, error: matchesError }, { data: predictions }] = await Promise.all([
    supabase
      .from("matches")
      .select("*")
      .neq("status", "finished")
      .is("home_score", null)
      .is("away_score", null)
      .order("kickoff_time", { ascending: true })
      .returns<Match[]>(),
    supabase.from("predictions").select("*").eq("user_id", user.id).returns<Prediction[]>()
  ]);

  const predictionByMatch = new Map((predictions ?? []).map((prediction) => [prediction.match_id, prediction]));

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <p className="eyebrow">Prediction center</p>
        <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Open and locked fixtures</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
          Upcoming matches stay here until a final result is entered. Finished fixtures move out of this view and remain visible in prediction history.
        </p>
      </div>

      {matchesError ? (
        <p className="rounded-md bg-coral/10 p-3 text-sm text-coral">{matchesError.message}</p>
      ) : null}

      {matches?.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} userId={user.id} prediction={predictionByMatch.get(match.id)} />
          ))}
        </div>
      ) : (
        <EmptyState title="No active fixtures" text="Upcoming and locked matches without final results will appear here when an admin adds them." />
      )}
    </div>
  );
}
