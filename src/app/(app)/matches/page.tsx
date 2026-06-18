import { EmptyState } from "@/components/EmptyState";
import { MatchCard } from "@/components/MatchCard";
import { requireUser } from "@/lib/auth";
import type { Match, Prediction } from "@/lib/types";

export default async function MatchesPage() {
  const { supabase, user } = await requireUser();

  const [{ data: matches, error: matchesError }, { data: predictions }] = await Promise.all([
    supabase.from("matches").select("*").order("kickoff_time", { ascending: true }).returns<Match[]>(),
    supabase.from("predictions").select("*").eq("user_id", user.id).returns<Prediction[]>()
  ]);

  const predictionByMatch = new Map((predictions ?? []).map((prediction) => [prediction.match_id, prediction]));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">Matches</h1>
        <p className="mt-1 text-sm text-ink/65">Predict scores before kickoff. Locked means the database also blocks edits.</p>
      </div>

      {matchesError ? (
        <p className="rounded-md bg-coral/10 p-3 text-sm text-coral">{matchesError.message}</p>
      ) : null}

      {matches?.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} userId={user.id} prediction={predictionByMatch.get(match.id)} />
          ))}
        </div>
      ) : (
        <EmptyState title="No matches yet" text="An admin can add the first fixture from the admin area." />
      )}
    </div>
  );
}
