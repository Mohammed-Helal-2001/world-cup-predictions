import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { requireUser } from "@/lib/auth";
import type { LeaderboardRow } from "@/lib/types";

export default async function LeaderboardPage() {
  const { supabase } = await requireUser();
  const { data: rows, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("total_points", { ascending: false })
    .order("exact_score_count", { ascending: false })
    .returns<LeaderboardRow[]>();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">Leaderboard</h1>
        <p className="mt-1 text-sm text-ink/65">Ranked by total points, then exact scores.</p>
      </div>

      {error ? <p className="rounded-md bg-coral/10 p-3 text-sm text-coral">{error.message}</p> : null}

      {rows?.length ? (
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          {rows.map((row, index) => (
            <div key={row.user_id} className="grid grid-cols-[56px_1fr_90px] items-center gap-3 border-b border-line px-4 py-4 last:border-0 sm:grid-cols-[70px_1fr_120px_120px_120px]">
              <div className="flex items-center gap-2 font-bold text-ink">
                {index < 3 ? <Trophy size={17} className="text-gold" /> : null}
                #{index + 1}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{row.display_name}</p>
                <p className="text-xs text-ink/55 sm:hidden">
                  {row.prediction_count} predictions, {row.exact_score_count} exact
                </p>
              </div>
              <div className="text-right font-bold text-pitch">{row.total_points} pts</div>
              <div className="hidden text-sm text-ink/70 sm:block">{row.prediction_count} predictions</div>
              <div className="hidden text-sm text-ink/70 sm:block">{row.exact_score_count} exact</div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No leaderboard data" text="Scores appear after users submit predictions." />
      )}
    </div>
  );
}
