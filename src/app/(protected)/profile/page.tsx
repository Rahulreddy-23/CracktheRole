import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileCard from "@/components/profile/ProfileCard";
import PreferencesForm from "@/components/profile/PreferencesForm";
import SubscriptionStatus from "@/components/profile/SubscriptionStatus";
import AccountActions from "@/components/profile/AccountActions";

async function getProfileData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Interviews this week for subscription usage bar
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count } = await supabase
    .from("interview_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", weekAgo.toISOString());

  return {
    profile,
    interviewsThisWeek: count ?? 0,
  };
}

export default async function ProfilePage() {
  const { profile, interviewsThisWeek } = await getProfileData();

  const tier = (profile?.subscription_tier ?? "free") as "free" | "pro" | "elite";

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Profile</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <ProfileCard />
          <PreferencesForm
            initialRole={profile?.target_role ?? ""}
            initialCompanies={profile?.target_companies ?? []}
            initialCurrentCtc={profile?.current_ctc ?? 0}
            initialTargetCtc={profile?.target_ctc ?? 0}
          />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <SubscriptionStatus tier={tier} interviewsThisWeek={interviewsThisWeek} />
          <AccountActions />
        </div>
      </div>
    </main>
  );
}
