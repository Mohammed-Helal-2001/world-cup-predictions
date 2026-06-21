"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } }
          });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "register" && !result.data.session) {
      setMessage("Registration saved. Check your email if confirmation is enabled.");
      return;
    }

    router.replace("/matches");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "register" ? (
        <div className="space-y-1.5">
          <label className="label" htmlFor="username">
            Display name
          </label>
          <input
            id="username"
            className="input"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Your leaderboard name"
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="input"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={6}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
        />
      </div>

      {error ? <p className="rounded-md bg-coral/10 p-3 text-sm font-medium text-coral">{error}</p> : null}
      {message ? <p className="rounded-md bg-pitch/10 p-3 text-sm font-medium text-pitch">{message}</p> : null}

      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
      </button>

      <p className="text-center text-sm text-ink/70">
        {mode === "login" ? "No account yet?" : "Already registered?"}{" "}
        <Link className="font-semibold text-pitch" href={mode === "login" ? "/register" : "/login"}>
          {mode === "login" ? "Register" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
