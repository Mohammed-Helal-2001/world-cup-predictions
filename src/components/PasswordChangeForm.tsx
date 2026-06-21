"use client";

import { FormEvent, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function PasswordChangeForm() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setSuccess("Password updated successfully.");
  }

  return (
    <form onSubmit={onSubmit} className="panel max-w-2xl space-y-5 p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-pitch/10 text-pitch">
          <KeyRound size={20} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-ink">Change password</h2>
          <p className="mt-1 text-sm leading-6 text-ink/65">
            Set a new password for the signed-in account. You will remain logged in after the update.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="label">New password</span>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
          />
        </label>
        <label className="space-y-1.5">
          <span className="label">Confirm new password</span>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat password"
          />
        </label>
      </div>

      {error ? <p className="rounded-md bg-coral/10 p-3 text-sm font-medium text-coral">{error}</p> : null}
      {success ? (
        <p className="flex items-center gap-2 rounded-md bg-pitch/10 p-3 text-sm font-medium text-pitch">
          <ShieldCheck size={16} />
          {success}
        </p>
      ) : null}

      <button className="btn-primary" disabled={loading}>
        {loading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
