import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { UserProvider } from "@/components/providers/user-provider";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Redirect new users to onboarding before they can access any protected page
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/dashboard";
  if (profile && !profile.onboarding_completed && !pathname.startsWith("/onboarding")) {
    redirect("/onboarding");
  }

  return (
    <UserProvider initialUser={user} initialProfile={profile}>
      {children}
    </UserProvider>
  );
}
