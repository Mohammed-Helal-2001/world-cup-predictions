"use client";

import { FormEvent, useState } from "react";
import { Crown, Eye, Save, ToggleLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { LeagueCelebrationSettings } from "@/lib/types";

type Props = {
  settings: LeagueCelebrationSettings | null;
  userId: string;
};

export function AdminCelebrationForm({ settings, userId }: Props) {
  const supabase = createClient();
  const [enabled, setEnabled] = useState(settings?.celebration_enabled ?? false);
  const [message, setMessage] = useState(settings?.celebration_message ?? "");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveSettings(enabled, "Celebration settings published.");
  }

  async function disableCelebration() {
    setEnabled(false);
    await saveSettings(false, "Celebration disabled.");
  }

  async function saveSettings(nextEnabled: boolean, successMessage: string) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: saveError } = await supabase.from("league_celebration_settings").upsert(
      {
        id: true,
        celebration_enabled: nextEnabled,
        celebration_message: message,
        updated_by: userId
      },
      { onConflict: "id" }
    );

    setLoading(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setSuccess(successMessage);
  }

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-line bg-gradient-to-r from-gold/20 via-white to-field px-5 py-4">
        <div className="flex items-center gap-3">
          <Crown className="text-gold" size={26} />
          <div>
            <p className="eyebrow">Celebration control</p>
            <h2 className="mt-1 text-xl font-bold text-ink">🏆 End of League Celebration</h2>
          </div>
        </div>
      </div>

      <form onSubmit={publish} className="space-y-4 p-5">
        <label className="flex items-start gap-3 rounded-md border border-line bg-field/50 p-3">
          <input
            className="mt-1 h-4 w-4 accent-pitch"
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          <span>
            <span className="block text-sm font-semibold text-ink">Enable Celebration</span>
            <span className="mt-1 block text-xs leading-5 text-ink/60">Show the championship ceremony on the Leaderboard page.</span>
          </span>
        </label>

        <label className="space-y-1.5">
          <span className="label">Celebration Message</span>
          <textarea
            className="input min-h-32 resize-y leading-6"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write the celebration message exactly as it should appear."
          />
        </label>

        {previewVisible ? (
          <div className="rounded-lg border border-gold/35 bg-gradient-to-br from-[#fff7cf] via-white to-field p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-gold">Preview Celebration</p>
            <p className="mt-2 text-lg font-black text-ink">👑 Champion</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/75">{message || "No celebration message yet."}</p>
          </div>
        ) : null}

        {error ? <p className="rounded-md bg-coral/10 p-2 text-sm font-medium text-coral">{error}</p> : null}
        {success ? <p className="rounded-md bg-pitch/10 p-2 text-sm font-medium text-pitch">{success}</p> : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" className="btn-secondary" onClick={() => setPreviewVisible((visible) => !visible)}>
            <Eye size={16} />
            Preview Celebration
          </button>
          <button className="btn-primary" disabled={loading}>
            <Save size={16} />
            {loading ? "Saving..." : "Publish Celebration"}
          </button>
          <button type="button" className="btn-secondary" disabled={loading} onClick={disableCelebration}>
            <ToggleLeft size={16} />
            Disable Celebration
          </button>
        </div>
      </form>
    </section>
  );
}
