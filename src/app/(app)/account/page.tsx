import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import { requireUser } from "@/lib/auth";

export default async function AccountPage() {
  const { profile } = await requireUser();

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <p className="eyebrow">Account security</p>
        <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
          Manage the signed-in account for {profile?.username || profile?.email || "this user"}.
        </p>
      </div>

      <PasswordChangeForm />
    </div>
  );
}
