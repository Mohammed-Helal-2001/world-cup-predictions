import Link from "next/link";
import { Shield, Trophy, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import type { Profile } from "@/lib/types";

export function AppNav({ profile }: { profile: Profile | null }) {
  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/matches" className="flex items-center gap-3 font-bold text-ink">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-pitch text-white shadow-sm">
            <Trophy size={18} />
          </span>
          <span>
            <span className="block leading-tight">World Cup Predictions</span>
            <span className="block text-xs font-semibold text-ink/50">Matchday dashboard</span>
          </span>
        </Link>
        <nav className="flex gap-2 overflow-x-auto pb-1 text-sm lg:flex-wrap lg:overflow-visible lg:pb-0">
          <Link className="btn-secondary" href="/matches">
            Matches
          </Link>
          <Link className="btn-secondary" href="/predictions">
            My Predictions
          </Link>
          <Link className="btn-secondary" href="/leaderboard">
            Leaderboard
          </Link>
          <Link className="btn-secondary" href="/account">
            <UserRound size={16} />
            Account
          </Link>
          {isAdmin ? (
            <Link className="btn-secondary" href="/admin">
              <Shield size={16} />
              Admin
            </Link>
          ) : null}
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
