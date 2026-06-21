"use client";

import { FormEvent, useState } from "react";
import { Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Match } from "@/lib/types";

export function ResultEntryForm({ match }: { match: Match }) {
  const router = useRouter();
  const supabase = createClient();
  const [homeScore, setHomeScore] = useState(match.home_score ?? 0);
  const [awayScore, setAwayScore] = useState(match.away_score ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: rpcError } = await supabase.rpc("finish_match_with_result", {
      target_match_id: match.id,
      final_home_score: homeScore,
      final_away_score: awayScore
    });

    setLoading(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    setSuccess("Result saved and points recalculated.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-md border border-line bg-field/40 p-4 sm:grid-cols-[1fr_96px_96px_auto] sm:items-end">
      <div>
        <p className="font-semibold">
          {match.home_team} vs {match.away_team}
        </p>
        <p className="mt-1 text-sm text-ink/60">Current status: {match.status}</p>
      </div>
      <label className="space-y-1.5">
        <span className="label">{match.home_team}</span>
        <input className="input" type="number" min={0} value={homeScore} onChange={(event) => setHomeScore(Number(event.target.value))} />
      </label>
      <label className="space-y-1.5">
        <span className="label">{match.away_team}</span>
        <input className="input" type="number" min={0} value={awayScore} onChange={(event) => setAwayScore(Number(event.target.value))} />
      </label>
      <button className="btn-primary" disabled={loading}>
        <Flag size={16} />
        {loading ? "Saving..." : "Save result"}
      </button>
      {error ? <p className="rounded-md bg-coral/10 p-2 text-sm font-medium text-coral sm:col-span-4">{error}</p> : null}
      {success ? <p className="rounded-md bg-pitch/10 p-2 text-sm font-medium text-pitch sm:col-span-4">{success}</p> : null}
    </form>
  );
}
