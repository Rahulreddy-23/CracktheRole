import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewContent from "./review-content";
import BackToDashboard from "@/components/shared/BackToDashboard";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewReviewPage({ params }: ReviewPageProps) {
  const { id } = await params;
  // Production path: fetch session from Supabase
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: session, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <BackToDashboard />
      </div>
      <ReviewContent session={session} />
    </main>
  );
}
