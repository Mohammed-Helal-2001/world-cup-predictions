"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Trophy, X } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { formatDateTime } from "@/lib/format";
import type { FinishedPredictionDetail, LeaderboardRow } from "@/lib/types";

type Props = {
  rows: LeaderboardRow[];
  details: FinishedPredictionDetail[];
};

export function LeaderboardDetails({ rows, details }: Props) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedRow = rows.find((row) => row.user_id === selectedUserId) ?? null;
  const detailsByUser = useMemo(() => {
    return details.reduce<Record<string, FinishedPredictionDetail[]>>((acc, detail) => {
      acc[detail.user_id] = acc[detail.user_id] ?? [];
      acc[detail.user_id].push(detail);
      return acc;
    }, {});
  }, [details]);
  const selectedDetails = selectedUserId ? detailsByUser[selectedUserId] ?? [] : [];

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="hidden grid-cols-[80px_1fr_120px_140px_120px_44px] border-b border-line bg-field/80 px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55 md:grid">
          <span>Rank</span>
          <span>Competitor</span>
          <span className="text-right">Points</span>
          <span className="text-right">Predictions</span>
          <span className="text-right">Exact</span>
          <span />
        </div>
        {rows.map((row, index) => (
          <button
            key={row.user_id}
            type="button"
            onClick={() => setSelectedUserId(row.user_id)}
            className="grid w-full grid-cols-[52px_1fr_84px_28px] items-center gap-3 border-b border-line px-4 py-4 text-left transition hover:bg-field/60 last:border-0 md:grid-cols-[80px_1fr_120px_140px_120px_44px]"
          >
            <div className="flex items-center gap-2 font-bold text-ink">
              {index < 3 ? <Trophy size={17} className="text-gold" /> : null}
              #{index + 1}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{row.display_name}</p>
              <p className="mt-1 text-xs text-ink/55 md:hidden">
                {row.prediction_count} predictions, {row.exact_score_count} exact
              </p>
            </div>
            <div className="text-right font-bold text-pitch">{row.total_points} pts</div>
            <div className="hidden text-right text-sm text-ink/70 md:block">{row.prediction_count}</div>
            <div className="hidden text-right text-sm text-ink/70 md:block">{row.exact_score_count}</div>
            <ChevronRight size={18} className="justify-self-end text-ink/35" />
          </button>
        ))}
      </div>

      {selectedRow ? (
        <div className="fixed inset-0 z-50 flex items-end bg-ink/55 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
          <div className="max-h-[88vh] w-full overflow-hidden rounded-t-lg bg-white shadow-soft sm:mx-auto sm:max-w-3xl sm:rounded-lg">
            <div className="flex items-start justify-between gap-4 border-b border-line p-4 sm:p-5">
              <div>
                <p className="eyebrow">Finished predictions</p>
                <h2 className="mt-1 text-xl font-bold text-ink">{selectedRow.display_name}</h2>
                <p className="mt-1 text-sm text-ink/60">
                  {selectedRow.total_points} total points, {selectedRow.exact_score_count} exact scores
                </p>
              </div>
              <button className="btn-secondary shrink-0 px-3" onClick={() => setSelectedUserId(null)} title="Close">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[68vh] overflow-y-auto p-4 sm:p-5">
              {selectedDetails.length ? (
                <div className="space-y-3">
                  {selectedDetails.map((detail) => (
                    <div key={detail.match_id} className="rounded-lg border border-line bg-field/50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-ink">
                            {detail.home_team} <span className="text-ink/35">vs</span> {detail.away_team}
                          </h3>
                          <p className="mt-1 text-sm text-ink/60">{formatDateTime(detail.kickoff_time)}</p>
                        </div>
                        {detail.exact_score ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-pitch/10 px-2.5 py-1 text-xs font-bold text-pitch">
                            <CheckCircle2 size={14} />
                            Exact score
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                        <div className="rounded-md bg-white p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-ink/45">Prediction</p>
                          <p className="mt-1 text-lg font-bold">
                            {detail.predicted_home_score} - {detail.predicted_away_score}
                          </p>
                        </div>
                        <div className="rounded-md bg-white p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-ink/45">Final result</p>
                          <p className="mt-1 text-lg font-bold">
                            {detail.final_home_score} - {detail.final_away_score}
                          </p>
                        </div>
                        <div className="rounded-md bg-white p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-ink/45">Points</p>
                          <p className="mt-1 text-lg font-bold text-pitch">{detail.points}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No finished predictions" text="This competitor has no predictions for finished matches yet." />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
