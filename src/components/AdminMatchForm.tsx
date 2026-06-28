"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Match, MatchStatus } from "@/lib/types";

export function AdminMatchForm({ match }: { match?: Match }) {
  const router = useRouter();
  const supabase = createClient();
  const [homeTeam, setHomeTeam] = useState(match?.home_team ?? "");
  const [awayTeam, setAwayTeam] = useState(match?.away_team ?? "");
  const [kickoffTime, setKickoffTime] = useState(match ? toLocalInput(match.kickoff_time) : "");
  const [status, setStatus] = useState<MatchStatus>(match?.status ?? "scheduled");
  const [penaltiesEnabled, setPenaltiesEnabled] = useState(match?.penalties_enabled ?? false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      home_team: homeTeam.trim(),
      away_team: awayTeam.trim(),
      kickoff_time: new Date(kickoffTime).toISOString(),
      status,
      penalties_enabled: penaltiesEnabled
    };

    const request = match
      ? supabase.from("matches").update(payload).eq("id", match.id)
      : supabase.from("matches").insert(payload);

    const { error: saveError } = await request;
    setLoading(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setSuccess(match ? "Match updated." : "Match created.");
    if (!match) {
      setHomeTeam("");
      setAwayTeam("");
      setKickoffTime("");
      setStatus("scheduled");
      setPenaltiesEnabled(false);
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className={match ? "space-y-4 border-t border-line pt-4" : "panel space-y-4 p-5"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="label">Home team</span>
          <input className="input" required value={homeTeam} onChange={(event) => setHomeTeam(event.target.value)} />
        </label>
        <label className="space-y-1.5">
          <span className="label">Away team</span>
          <input className="input" required value={awayTeam} onChange={(event) => setAwayTeam(event.target.value)} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="label">Kickoff time</span>
          <input
            className="input"
            required
            type="datetime-local"
            value={kickoffTime}
            onChange={(event) => setKickoffTime(event.target.value)}
          />
        </label>
        <label className="space-y-1.5">
          <span className="label">Status</span>
          <select className="input" value={status} onChange={(event) => setStatus(event.target.value as MatchStatus)}>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="finished">Finished</option>
          </select>
        </label>
      </div>
      <label className="flex items-start gap-3 rounded-md border border-line bg-field/40 p-3">
        <input
          className="mt-1 h-4 w-4 accent-pitch"
          type="checkbox"
          checked={penaltiesEnabled}
          onChange={(event) => setPenaltiesEnabled(event.target.checked)}
        />
        <span>
          <span className="block text-sm font-semibold text-ink">Enable penalty shootout prediction for this match</span>
          <span className="mt-1 block text-xs leading-5 text-ink/60">Use only for knockout matches where a drawn score needs a penalty winner.</span>
        </span>
      </label>
      {error ? <p className="rounded-md bg-coral/10 p-2 text-sm text-coral">{error}</p> : null}
      {success ? <p className="rounded-md bg-pitch/10 p-2 text-sm text-pitch">{success}</p> : null}
      <button className="btn-primary" disabled={loading}>
        <Save size={16} />
        {loading ? "Saving..." : match ? "Save changes" : "Create match"}
      </button>
    </form>
  );
}

function toLocalInput(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}
