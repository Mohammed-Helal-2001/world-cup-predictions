import { AdminMatchForm } from "@/components/AdminMatchForm";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";
import type { Match } from "@/lib/types";

export default async function AdminMatchesPage() {
  const { supabase } = await requireAdmin();
  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_time", { ascending: true })
    .returns<Match[]>();

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <p className="eyebrow">Fixture control</p>
        <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Admin Match Management</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">Create fixtures and adjust kickoff timing before matchday.</p>
      </div>

      <AdminMatchForm />

      {error ? <p className="rounded-md bg-coral/10 p-3 text-sm text-coral">{error.message}</p> : null}

      {matches?.length ? (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="panel p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold">
                    {match.home_team} vs {match.away_team}
                  </h2>
                  <p className="text-sm text-ink/60">{formatDateTime(match.kickoff_time)}</p>
                </div>
                <StatusBadge kickoffTime={match.kickoff_time} status={match.status} />
              </div>
              <AdminMatchForm match={match} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No fixtures yet" text="Create the first match using the form above." />
      )}
    </div>
  );
}
