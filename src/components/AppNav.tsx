import Link from "next/link";
import { Trophy } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import type { Profile } from "@/lib/types";

export function AppNav({ profile }: { profile: Profile | null }) {
  const isAdmin = profile?.role === "admin";

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/matches" className="flex items-center gap-2 font-bold text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-pitch text-white">
            <Trophy size={18} />
          </span>
          World Cup Predictions
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link className="btn-secondary" href="/matches">
            Matches
          </Link>
          <Link className="btn-secondary" href="/predictions">
            My Predictions
          </Link>
          <Link className="btn-secondary" href="/leaderboard">
            Leaderboard
          </Link>
          {isAdmin ? (
            <Link className="btn-secondary" href="/admin">
              Admin
            </Link>
          ) : null}
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
