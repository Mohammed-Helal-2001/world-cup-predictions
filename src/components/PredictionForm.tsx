"use client";

import { FormEvent, useState } from "react";
import { Minus, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Match, PenaltyWinnerTeam, Prediction } from "@/lib/types";
import { isPredictionOpen } from "@/lib/format";

type Props = {
  match: Match;
  userId: string;
  prediction?: Prediction | null;
};

function ScoreControl({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  function decrement() {
    onChange(Math.max(0, value - 1));
  }

  function increment() {
    onChange(value + 1);
  }

  return (
    <div className="space-y-1.5">
      <span className="label block truncate">{label}</span>
      <div className="grid grid-cols-[44px_1fr_44px] items-center overflow-hidden rounded-md border border-line bg-white">
        <button
          type="button"
          className="flex min-h-12 items-center justify-center border-r border-line text-ink transition hover:bg-field disabled:cursor-not-allowed disabled:text-ink/30"
          onClick={decrement}
          disabled={value === 0}
          aria-label={`Decrease ${label} score`}
        >
          <Minus size={18} />
        </button>
        <div className="flex min-h-12 items-center justify-center px-3 text-center text-xl font-bold text-ink" aria-live="polite">
          {value}
        </div>
        <button
          type="button"
          className="flex min-h-12 items-center justify-center border-l border-line text-ink transition hover:bg-field"
          onClick={increment}
          aria-label={`Increase ${label} score`}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

export function PredictionForm({ match, userId, prediction }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const open = isPredictionOpen(match.kickoff_time) && match.status !== "finished";
  const [homeScore, setHomeScore] = useState(prediction?.home_score ?? 0);
  const [awayScore, setAwayScore] = useState(prediction?.away_score ?? 0);
  const [penaltyWinner, setPenaltyWinner] = useState<PenaltyWinnerTeam | null>(prediction?.penalty_winner_team ?? null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const showPenaltyWinner = match.penalties_enabled && homeScore === awayScore;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (showPenaltyWinner && !penaltyWinner) {
      setError("Choose who wins on penalties.");
      return;
    }

    setLoading(true);

    const payload = {
      match_id: match.id,
      user_id: userId,
      home_score: homeScore,
      away_score: awayScore,
      penalty_winner_team: showPenaltyWinner ? penaltyWinner : null
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
      <div className="rounded-md border border-line bg-white p-3 text-sm font-medium text-ink/70">
        Predictions are locked for this match. Your saved score is protected.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreControl label={match.home_team} value={homeScore} onChange={setHomeScore} />
        <ScoreControl label={match.away_team} value={awayScore} onChange={setAwayScore} />
      </div>
      {showPenaltyWinner ? (
        <div className="rounded-md border border-line bg-field/50 p-3">
          <p className="label">Who wins on penalties?</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-md border border-line bg-white p-3 text-sm font-semibold">
              <input
                className="h-4 w-4 accent-pitch"
                type="radio"
                name={`penalty-winner-${match.id}`}
                checked={penaltyWinner === "home"}
                onChange={() => setPenaltyWinner("home")}
                required
              />
              {match.home_team}
            </label>
            <label className="flex items-center gap-2 rounded-md border border-line bg-white p-3 text-sm font-semibold">
              <input
                className="h-4 w-4 accent-pitch"
                type="radio"
                name={`penalty-winner-${match.id}`}
                checked={penaltyWinner === "away"}
                onChange={() => setPenaltyWinner("away")}
                required
              />
              {match.away_team}
            </label>
          </div>
        </div>
      ) : null}
      {error ? <p className="rounded-md bg-coral/10 p-2 text-sm text-coral">{error}</p> : null}
      {success ? <p className="rounded-md bg-pitch/10 p-2 text-sm text-pitch">{success}</p> : null}
      <button className="btn-primary w-full" disabled={loading}>
        <Save size={16} />
        {loading ? "Saving..." : prediction ? "Update prediction" : "Save prediction"}
      </button>
    </form>
  );
}
