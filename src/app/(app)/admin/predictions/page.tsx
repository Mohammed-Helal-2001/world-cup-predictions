import { CheckCircle2, Clock3 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";
import type { AdminPredictionRow } from "@/lib/types";

export default async function AdminPredictionsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("predictions")
    .select("*, profiles(id,email,username,role), matches(*)")
    .returns<AdminPredictionRow[]>();

  const predictions = [...(data ?? [])].sort((a, b) => {
    const aTime = a.matches?.kickoff_time ? new Date(a.matches.kickoff_time).getTime() : 0;
    const bTime = b.matches?.kickoff_time ? new Date(b.matches.kickoff_time).getTime() : 0;

    if (aTime !== bTime) return bTime - aTime;

    return getDisplayName(a).localeCompare(getDisplayName(b), "en", { sensitivity: "base" });
  });

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <p className="eyebrow">Prediction audit</p>
        <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">All User Predictions</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
          Read-only admin view of every submitted prediction across upcoming, locked, live, and finished fixtures.
        </p>
      </div>

      {error ? <p className="rounded-md bg-coral/10 p-3 text-sm font-medium text-coral">{error.message}</p> : null}

      {predictions.length ? (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-line bg-white shadow-sm xl:block">
            <div className="grid grid-cols-[1.2fr_1.3fr_1fr_110px_110px_80px_110px_135px_135px] gap-3 border-b border-line bg-field/80 px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">
              <span>User</span>
              <span>Match</span>
              <span>Kickoff</span>
              <span>Status</span>
              <span>Prediction</span>
              <span>Result</span>
              <span>Points</span>
              <span>Created</span>
              <span>Updated</span>
            </div>
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                className="grid grid-cols-[1.2fr_1.3fr_1fr_110px_110px_80px_110px_135px_135px] items-center gap-3 border-b border-line px-4 py-3 text-sm last:border-0"
              >
                <UserCell prediction={prediction} />
                <span className="font-semibold">{formatMatchName(prediction)}</span>
                <span className="text-ink/70">{prediction.matches ? formatDateTime(prediction.matches.kickoff_time) : "-"}</span>
                <span>{prediction.matches ? <StatusBadge kickoffTime={prediction.matches.kickoff_time} status={prediction.matches.status} /> : "-"}</span>
                <ScoreText home={prediction.home_score} away={prediction.away_score} />
                <span>{prediction.matches ? <FinalResultText prediction={prediction} /> : "-"}</span>
                <PointsCell prediction={prediction} />
                <span className="text-ink/70">{formatDateTime(prediction.created_at)}</span>
                <span className="text-ink/70">{formatDateTime(prediction.updated_at)}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:hidden">
            {predictions.map((prediction) => (
              <article key={prediction.id} className="panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{getDisplayName(prediction)}</p>
                    <p className="mt-1 truncate text-sm text-ink/55">{prediction.profiles?.email || "No email available"}</p>
                  </div>
                  {prediction.matches ? <StatusBadge kickoffTime={prediction.matches.kickoff_time} status={prediction.matches.status} /> : null}
                </div>

                <div className="mt-4 rounded-md bg-field/70 p-3">
                  <p className="font-bold">{formatMatchName(prediction)}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-ink/60">
                    <Clock3 size={15} />
                    {prediction.matches ? formatDateTime(prediction.matches.kickoff_time) : "No kickoff time"}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <Metric label="Prediction" value={`${prediction.home_score} - ${prediction.away_score}`} />
                  <Metric label="Result" value={prediction.matches ? formatFinalResult(prediction) : "-"} />
                  <Metric label="Points" value={`${prediction.points}`} highlight />
                </div>

                <div className="mt-4 grid gap-2 text-xs text-ink/55 sm:grid-cols-2">
                  <span>Created: {formatDateTime(prediction.created_at)}</span>
                  <span>Updated: {formatDateTime(prediction.updated_at)}</span>
                </div>

                {prediction.exact_score ? (
                  <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-pitch/10 px-2.5 py-1 text-xs font-bold text-pitch">
                    <CheckCircle2 size={14} />
                    Exact score
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="No predictions submitted" text="Every submitted prediction will appear here once users start saving scores." />
      )}
    </div>
  );
}

function getDisplayName(prediction: AdminPredictionRow) {
  return prediction.profiles?.username || prediction.profiles?.email || "Unknown user";
}

function formatMatchName(prediction: AdminPredictionRow) {
  if (!prediction.matches) return "Unknown match";
  return `${prediction.matches.home_team} vs ${prediction.matches.away_team}`;
}

function formatFinalResult(prediction: AdminPredictionRow) {
  const match = prediction.matches;
  if (!match || match.home_score === null || match.away_score === null) return "-";
  return `${match.home_score} - ${match.away_score}`;
}

function UserCell({ prediction }: { prediction: AdminPredictionRow }) {
  return (
    <span className="min-w-0">
      <span className="block truncate font-semibold">{getDisplayName(prediction)}</span>
      <span className="block truncate text-xs text-ink/50">{prediction.profiles?.email || "No email available"}</span>
    </span>
  );
}

function ScoreText({ home, away }: { home: number; away: number }) {
  return (
    <span className="font-bold">
      {home} - {away}
    </span>
  );
}

function FinalResultText({ prediction }: { prediction: AdminPredictionRow }) {
  return <span className="font-semibold">{formatFinalResult(prediction)}</span>;
}

function PointsCell({ prediction }: { prediction: AdminPredictionRow }) {
  return (
    <span className="inline-flex items-center gap-1 font-bold text-pitch">
      {prediction.exact_score ? <CheckCircle2 size={15} /> : null}
      {prediction.points}
    </span>
  );
}

function Metric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-md bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-ink/45">{label}</p>
      <p className={`mt-1 text-lg font-bold ${highlight ? "text-pitch" : "text-ink"}`}>{value}</p>
    </div>
  );
}
