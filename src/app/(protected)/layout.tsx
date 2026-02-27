import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserProvider } from "@/components/providers/user-provider";

// ------------------------------------------------------------------
// DEV-ONLY: Authentication bypass for local testing.
// Set NEXT_PUBLIC_DEV_BYPASS=true in .env.local to skip auth.
// Remove this block before deploying to production.
// ------------------------------------------------------------------
const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

const MOCK_USER = {
  id: "dev-bypass-user-id",
  email: "dev@cracktherole.test",
  app_metadata: {},
  user_metadata: { full_name: "Dev User" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as import("@supabase/supabase-js").User;

const MOCK_PROFILE = {
  id: "dev-bypass-user-id",
  full_name: "Dev User",
  avatar_url: null,
  target_role: "data_engineer",
  target_companies: ["Google", "Amazon"],
  current_ctc: 12,
  target_ctc: 40,
  experience_years: 3,
  prep_timeline: "3_months",
  subscription_tier: "free" as const,
  streak_count: 5,
  last_active_date: new Date().toISOString().split("T")[0],
  onboarding_completed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
// ------------------------------------------------------------------

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // DEV-ONLY: bypass auth when env var is set
  if (DEV_BYPASS) {
    return (
      <UserProvider initialUser={MOCK_USER} initialProfile={MOCK_PROFILE}>
        {children}
      </UserProvider>
    );
  }

  const supabase = await createClient();

  // Always use getUser() for server-side auth validation.
  // Unlike getSession(), getUser() re-validates the JWT with the Supabase auth server.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <UserProvider initialUser={user} initialProfile={profile}>
      {children}
    </UserProvider>
  );
}
