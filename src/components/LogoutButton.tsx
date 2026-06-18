"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button className="btn-secondary" onClick={logout} title="Log out">
      <LogOut size={16} />
      <span className="hidden sm:inline">Log out</span>
    </button>
  );
}
