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
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="eyebrow">World Cup Predictions</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-ink/65">Join the game with email and password.</p>
        </div>
        <div className="panel p-6">
          <AuthForm mode="register" />
        </div>
      </section>
    </main>
  );
}
