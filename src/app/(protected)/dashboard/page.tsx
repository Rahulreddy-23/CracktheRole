import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsRow from "@/components/dashboard/StatsRow";
import DailyChallenge from "@/components/dashboard/DailyChallenge";
import RecentSessions from "@/components/dashboard/RecentSessions";
import ProgressChart from "@/components/dashboard/ProgressChart";
import QuickActions from "@/components/dashboard/QuickActions";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your CrackTheRole dashboard. Track interview progress, view recent sessions, and start new mock interviews.",
};

// ---- Skeleton loaders -------------------------------------------------------

function BannerSkeleton() {
  return (
    <div className="rounded-2xl border border-border/30 bg-surface/40 p-6 sm:p-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-56 bg-border/30 rounded-lg mb-2" />
          <div className="h-4 w-32 bg-border/20 rounded-md" />
        </div>
        <div className="h-10 w-28 bg-border/30 rounded-lg" />
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/30 bg-surface/40 p-5 animate-pulse"
        >
          <div className="w-9 h-9 bg-border/20 rounded-lg mb-3" />
          <div className="h-3 w-24 bg-border/20 rounded-md mb-2" />
          <div className="h-7 w-16 bg-border/30 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function CardSkeleton({ height = "h-40" }: { height?: string }) {
  return (
    <div
      className={`rounded-xl border border-border/30 bg-surface/40 animate-pulse ${height}`}
    />
  );
}

// ---- Server-side data fetching helpers --------------------------------------

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

// Mock data for dev bypass mode
const MOCK_SESSIONS = [
  {
    id: "mock-1",
    interview_type: "dsa",
    company_context: "Google",
    overall_score: 82,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    duration_seconds: 2700,
  },
  {
    id: "mock-2",
    interview_type: "system_design",
    company_context: "Amazon",
    overall_score: 68,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    duration_seconds: 3200,
  },
  {
    id: "mock-3",
    interview_type: "behavioral",
    company_context: null,
    overall_score: 91,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    duration_seconds: 1800,
  },
  {
    id: "mock-4",
    interview_type: "sql",
    company_context: "Flipkart",
    overall_score: 55,
    created_at: new Date(Date.now() - 518400000).toISOString(),
    duration_seconds: 2100,
  },
  {
    id: "mock-5",
    interview_type: "dsa",
    company_context: "Microsoft",
    overall_score: 73,
    created_at: new Date(Date.now() - 691200000).toISOString(),
    duration_seconds: 2400,
  },
];

const MOCK_CHALLENGE = {
  id: "mock-challenge",
  title: "Design a URL Shortener",
  description:
    "Design a system that can shorten long URLs and redirect users efficiently. Consider the data model, API design, hash generation strategy, and how you would handle high traffic. Discuss trade-offs between different approaches for generating unique short codes.",
  difficulty: "medium" as const,
  category: "system_design",
};

async function getDashboardData() {
  if (DEV_BYPASS) {
    const scores = MOCK_SESSIONS.map((s) => s.overall_score).filter(
      (s): s is number => s !== null
    );
    const avg = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    return {
      sessions: MOCK_SESSIONS,
      totalInterviews: MOCK_SESSIONS.length,
      averageScore: avg,
      questionsPracticed: 12,
      scoreHistory: MOCK_SESSIONS.map((s) => ({
        date: s.created_at,
        score: s.overall_score ?? 0,
      })).reverse(),
      dailyChallenge: MOCK_CHALLENGE,
      isChallengeCompleted: false,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      sessions: [],
      totalInterviews: 0,
      averageScore: 0,
      questionsPracticed: 0,
      scoreHistory: [],
      dailyChallenge: null,
      isChallengeCompleted: false,
    };
  }

  // Fetch recent completed sessions (last 5)
  const { data: sessions } = await supabase
    .from("interview_sessions")
    .select(
      "id, interview_type, company_context, overall_score, created_at, duration_seconds"
    )
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch all completed sessions for stats
  const { data: allSessions } = await supabase
    .from("interview_sessions")
    .select("overall_score, created_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch bookmarks count for "questions practiced"
  const { count: bookmarkCount } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch today's daily challenge
  const today = new Date().toISOString().split("T")[0];
  const { data: challengeRow } = await supabase
    .from("daily_challenges")
    .select("id, question_id")
    .eq("challenge_date", today)
    .maybeSingle();

  // Fetch the related question separately to avoid Supabase join type issues
  let dailyChallenge: {
    id: string;
    title: string;
    description: string;
    difficulty: "easy" | "medium" | "hard";
    category: string;
  } | null = null;

  if (challengeRow) {
    const { data: question } = await supabase
      .from("questions")
      .select("id, title, description, difficulty, category")
      .eq("id", challengeRow.question_id)
      .single();

    if (question) {
      dailyChallenge = {
        id: question.id,
        title: question.title,
        description: question.description,
        difficulty: question.difficulty,
        category: question.category,
      };
    }
  }

  // Check if the user completed today's challenge
  let isChallengeCompleted = false;
  if (challengeRow) {
    const { data: completion } = await supabase
      .from("challenge_completions")
      .select("id")
      .eq("user_id", user.id)
      .eq("challenge_id", challengeRow.id)
      .maybeSingle();
    isChallengeCompleted = !!completion;
  }

  const completedSessions = allSessions ?? [];
  const scores = completedSessions
    .map((s) => s.overall_score)
    .filter((s): s is number => s !== null);
  const avg =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const scoreHistory = completedSessions
    .filter((s) => s.overall_score !== null)
    .map((s) => ({
      date: s.created_at,
      score: s.overall_score as number,
    }))
    .reverse();

  return {
    sessions: sessions ?? [],
    totalInterviews: completedSessions.length,
    averageScore: avg,
    questionsPracticed: bookmarkCount ?? 0,
    scoreHistory,
    dailyChallenge,
    isChallengeCompleted,
  };
}

// ---- Page -------------------------------------------------------------------

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <main id="main-content" className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* Welcome banner */}
        <Suspense fallback={<BannerSkeleton />}>
          <WelcomeBanner />
        </Suspense>

        {/* Stats row */}
        <Suspense fallback={<StatsSkeleton />}>
          <StatsRow
            totalInterviews={data.totalInterviews}
            averageScore={data.averageScore}
            questionsPracticed={data.questionsPracticed}
          />
        </Suspense>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left column (wider) */}
          <div className="flex flex-col gap-6">
            <Suspense fallback={<CardSkeleton height="h-64" />}>
              <RecentSessions sessions={data.sessions} />
            </Suspense>

            <Suspense fallback={<CardSkeleton height="h-32" />}>
              <DailyChallenge
                challenge={data.dailyChallenge}
                isCompleted={data.isChallengeCompleted}
              />
            </Suspense>
          </div>

          {/* Right column (narrower) */}
          <div className="flex flex-col gap-6">
            <Suspense fallback={<CardSkeleton height="h-52" />}>
              <ProgressChart data={data.scoreHistory} />
            </Suspense>

            <Suspense fallback={<CardSkeleton height="h-56" />}>
              <QuickActions />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
