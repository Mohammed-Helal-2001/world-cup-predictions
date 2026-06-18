"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Match, Prediction } from "@/lib/types";
import { isPredictionOpen } from "@/lib/format";

type Props = {
  match: Match;
  userId: string;
  prediction?: Prediction | null;
};

export function PredictionForm({ match, userId, prediction }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const open = isPredictionOpen(match.kickoff_time) && match.status !== "finished";
  const [homeScore, setHomeScore] = useState(prediction?.home_score ?? 0);
  const [awayScore, setAwayScore] = useState(prediction?.away_score ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      match_id: match.id,
      user_id: userId,
      home_score: homeScore,
      away_score: awayScore
    };

    const { error: saveError } = await supabase
      .from("predictions")
      .upsert(payload, { onConflict: "match_id,user_id" });

    setLoading(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setSuccess("Prediction saved.");
    router.refresh();
  }

  if (!open) {
    return (
      <div className="rounded-md bg-field p-3 text-sm text-ink/70">
        Predictions are locked for this match.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5">
          <span className="label">{match.home_team}</span>
          <input
            className="input"
            type="number"
            min={0}
            value={homeScore}
            onChange={(event) => setHomeScore(Number(event.target.value))}
          />
        </label>
        <label className="space-y-1.5">
          <span className="label">{match.away_team}</span>
          <input
            className="input"
            type="number"
            min={0}
            value={awayScore}
            onChange={(event) => setAwayScore(Number(event.target.value))}
          />
        </label>
      </div>
      {error ? <p className="rounded-md bg-coral/10 p-2 text-sm text-coral">{error}</p> : null}
      {success ? <p className="rounded-md bg-pitch/10 p-2 text-sm text-pitch">{success}</p> : null}
      <button className="btn-primary w-full" disabled={loading}>
        <Save size={16} />
        {loading ? "Saving..." : prediction ? "Update prediction" : "Save prediction"}
      </button>
    </form>
  );
}
