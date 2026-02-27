import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ScoreTrendChart from "@/components/progress/ScoreTrendChart";
import CategoryRadarChart from "@/components/progress/CategoryRadarChart";
import SessionsTable from "@/components/progress/SessionsTable";
import InsightsCard from "@/components/progress/InsightsCard";

async function getProgressData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("interview_sessions")
    .select(
      "id, created_at, interview_type, company_context, difficulty, overall_score, score_technical, score_communication, score_problem_solving, score_time_management, duration_seconds, status"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const all = sessions ?? [];
  const completed = all.filter(
    (s) => s.status === "completed" && s.overall_score !== null
  );

  const scoreTrend = completed.map((s) => ({
    date: s.created_at,
    score: s.overall_score as number,
    interview_type: s.interview_type,
    company_context: s.company_context,
  }));

  function avg(
    field:
      | "score_technical"
      | "score_communication"
      | "score_problem_solving"
      | "score_time_management"
  ) {
    const vals = completed
      .map((s) => s[field])
      .filter((v): v is number => v !== null);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return {
    scoreTrend,
    technical: avg("score_technical"),
    communication: avg("score_communication"),
    problemSolving: avg("score_problem_solving"),
    timeManagement: avg("score_time_management"),
    interviewsThisWeek: all.filter((s) => new Date(s.created_at) >= weekAgo).length,
    allSessions: all,
  };
}

export default async function ProgressPage() {
  const data = await getProgressData();

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Progress Analytics</h1>
        <p className="text-text-secondary text-sm mt-1">
          Track your interview preparation journey
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <ScoreTrendChart data={data.scoreTrend} />
          <CategoryRadarChart
            technical={data.technical}
            communication={data.communication}
            problemSolving={data.problemSolving}
            timeManagement={data.timeManagement}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <SessionsTable sessions={data.allSessions} />
          <InsightsCard
            technical={data.technical}
            communication={data.communication}
            problemSolving={data.problemSolving}
            timeManagement={data.timeManagement}
            interviewsThisWeek={data.interviewsThisWeek}
          />
        </div>
      </div>
    </main>
  );
}
