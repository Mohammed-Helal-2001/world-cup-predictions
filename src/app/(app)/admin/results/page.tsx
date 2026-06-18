import { ResultEntryForm } from "@/components/ResultEntryForm";
import { EmptyState } from "@/components/EmptyState";
import { requireAdmin } from "@/lib/auth";
import type { Match } from "@/lib/types";

export default async function AdminResultsPage() {
  const { supabase } = await requireAdmin();
  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_time", { ascending: false })
    .returns<Match[]>();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">Admin Result Entry</h1>
        <p className="mt-1 text-sm text-ink/65">Saving a result sets the match to finished and recalculates every related prediction.</p>
      </div>

      {error ? <p className="rounded-md bg-coral/10 p-3 text-sm text-coral">{error.message}</p> : null}

      {matches?.length ? (
        <div className="panel space-y-3 p-4">
          {matches.map((match) => (
            <ResultEntryForm key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <EmptyState title="No matches available" text="Create matches before entering results." />
      )}
    </div>
  );
}
