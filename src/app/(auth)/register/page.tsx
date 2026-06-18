import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) redirect("/matches");

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#E6F4EF,transparent_32%),linear-gradient(135deg,#F7F9FC,#FFFFFF)] px-4 py-8">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-pitch">World Cup Predictions</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Create your account</h1>
          <p className="mt-2 text-sm text-ink/65">Join the game with email and password.</p>
        </div>
        <div className="panel p-6">
          <AuthForm mode="register" />
        </div>
      </section>
    </main>
  );
}
