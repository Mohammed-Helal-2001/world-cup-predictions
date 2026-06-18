import Link from "next/link";
import { CalendarPlus, Flag, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-ink/65">Manage fixtures and enter final results.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/matches" className="panel p-5 transition hover:border-pitch">
          <CalendarPlus className="text-pitch" size={26} />
          <h2 className="mt-4 text-lg font-bold">Match Management</h2>
          <p className="mt-1 text-sm text-ink/65">Create fixtures, edit kickoff time, and update status.</p>
        </Link>
        <Link href="/admin/results" className="panel p-5 transition hover:border-pitch">
          <Flag className="text-pitch" size={26} />
          <h2 className="mt-4 text-lg font-bold">Result Entry</h2>
          <p className="mt-1 text-sm text-ink/65">Save final scores and automatically recalculate points.</p>
        </Link>
      </div>
      <div className="rounded-lg border border-line bg-field p-4 text-sm text-ink/70">
        <ShieldCheck className="mr-2 inline text-pitch" size={17} />
        Admin access is checked on the server and enforced by Supabase RLS.
      </div>
    </div>
  );
}
