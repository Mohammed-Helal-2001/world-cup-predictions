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
    <div className="space-y-6">
      <div className="page-heading">
        <p className="eyebrow">Scoring control</p>
        <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Admin Result Entry</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
          Saving a result sets the match to finished and recalculates every related prediction through the secured database function.
        </p>
      </div>

      {error ? <p className="rounded-md bg-coral/10 p-3 text-sm text-coral">{error.message}</p> : null}

      {matches?.length ? (
        <div className="panel space-y-3 p-4 sm:p-5">
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
