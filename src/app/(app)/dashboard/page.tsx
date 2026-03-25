"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Target,
  FileText,
  Crown,
  BarChart3,
  Code2,
  Zap,
  ArrowRight,
  Clock,
  History,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/shared/stat-card";
import EmptyState from "@/components/shared/empty-state";
import PageHeader from "@/components/shared/page-header";
import { useAuth } from "@/hooks/use-auth";
import { getInterviewHistory } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { InterviewSession } from "@/types";

// ── helpers ────────────────────────────────────────────────────────────────

type FirestoreSession = Omit<InterviewSession, "startedAt" | "completedAt"> & {
  startedAt: { toDate?: () => Date; seconds?: number } | Date;
  completedAt?: { toDate?: () => Date; seconds?: number } | Date;
};

function toDate(val: FirestoreSession["startedAt"] | undefined): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof (val as { toDate?: () => Date }).toDate === "function")
    return (val as { toDate: () => Date }).toDate();
  if (typeof (val as { seconds?: number }).seconds === "number")
    return new Date((val as { seconds: number }).seconds * 1000);
  return null;
}

function formatDate(val: FirestoreSession["startedAt"] | undefined): string {
  const d = toDate(val);
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const TYPE_LABEL: Record<string, string> = {
  coding: "Coding",
  "system-design": "System Design",
  behavioral: "Behavioral",
};

const TYPE_CLASS: Record<string, string> = {
  coding: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "system-design": "bg-purple-500/15 text-purple-400 border-purple-500/20",
  behavioral: "bg-teal-500/15 text-teal-400 border-teal-500/20",
};

const DIFF_CLASS: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  hard: "bg-red-500/15 text-red-400 border-red-500/20",
};

const STATUS_CLASS: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "in-progress": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  abandoned: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

// ── component ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [sessions, setSessions] = useState<FirestoreSession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const isPro = userProfile?.plan === "pro";
  const interviewsUsed = userProfile?.interviewsUsed ?? 0;
  const interviewsLimit = userProfile?.interviewsLimit ?? 1;
  const resumesUsed = userProfile?.resumesUsed ?? 0;
  const resumesLimit = userProfile?.resumesLimit ?? 1;

  const interviewsLeft = Math.max(0, interviewsLimit - interviewsUsed);
  const resumesLeft = Math.max(0, resumesLimit - resumesUsed);
  const interviewLimitReached = interviewsLeft === 0;
  const resumeLimitReached = resumesLeft === 0;

  // avg score from completed sessions
  const avgScore = (() => {
    const scored = sessions.filter(
      (s) => s.status === "completed" && s.feedback?.overallScore != null
    );
    if (!scored.length) return null;
    const total = scored.reduce((acc, s) => acc + (s.feedback?.overallScore ?? 0), 0);
    return Math.round(total / scored.length);
  })();

  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  useEffect(() => {
    if (!user?.uid) return;
    setHistoryLoading(true);
    getInterviewHistory(user.uid, 5)
      .then((data) => setSessions(data as FirestoreSession[]))
      .catch(console.error)
      .finally(() => setHistoryLoading(false));
  }, [user?.uid]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ── Section 1: Welcome Banner ── */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-start gap-4"
      >
        <div className="flex-1">
          <PageHeader
            className="mb-0"
            title={
              <>
                Welcome back, <span className="text-gradient cursor-pointer hover:opacity-80 transition-opacity">{firstName}!</span>
              </>
            }
            description="Here's how you're doing so far."
          >
            <div className="flex items-center gap-2 mt-1.5 self-start">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-semibold",
                  isPro
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                )}
              >
                {isPro ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" /> Pro Plan
                  </>
                ) : (
                  "Free Plan"
                )}
              </Badge>
            </div>
          </PageHeader>
        </div>

        {/* Free plan usage summary */}
        {!isPro && (
          <div className="glass rounded-xl p-4 sm:w-72 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Usage this month
              </p>
              <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                <Link href="/settings">Upgrade</Link>
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-muted-foreground">Interviews</span>
                <span className="font-medium">{interviewsUsed}/{interviewsLimit}</span>
              </div>
              <Progress value={(interviewsUsed / interviewsLimit) * 100} className="h-1.5" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-muted-foreground">Resumes</span>
                <span className="font-medium">{resumesUsed}/{resumesLimit}</span>
              </div>
              <Progress value={(resumesUsed / resumesLimit) * 100} className="h-1.5" />
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Section 2: Quick Stats ── */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Interviews Done"
          value={interviewsUsed}
          icon={Target}
          used={interviewsUsed}
          limit={interviewsLimit}
        />
        <StatCard
          title="Resumes Built"
          value={resumesUsed}
          icon={FileText}
          used={resumesUsed}
          limit={resumesLimit}
        />
        <StatCard
          title="Current Plan"
          value={isPro ? "Pro" : "Free"}
          icon={Crown}
        />
        <StatCard
          title="Avg Score"
          value={avgScore !== null ? `${avgScore}%` : "—"}
          icon={BarChart3}
        />
      </motion.div>

      {/* ── Section 3: Quick Actions ── */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Interview card */}
        <Link
          href={interviewLimitReached ? "/settings" : "/interview"}
          className="group"
        >
          <div className="glass rounded-xl p-6 h-full flex flex-col gap-4 transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/5 hover:scale-[1.01] cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <Code2 className="w-6 h-6 text-blue-400" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/50 mt-1 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">Start Mock Interview</h3>
              <p className="text-sm text-muted-foreground">
                Practice coding, system design, or behavioral interviews with AI
              </p>
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {interviewLimitReached
                  ? "Limit reached"
                  : `${interviewsLeft} of ${interviewsLimit} remaining`}
              </p>
              <Button
                size="sm"
                variant={interviewLimitReached ? "outline" : "default"}
                className="pointer-events-none"
              >
                {interviewLimitReached ? "Upgrade to Continue" : "Start Interview"}
              </Button>
            </div>
          </div>
        </Link>

        {/* Resume card */}
        <Link
          href={resumeLimitReached ? "/settings" : "/resume"}
          className="group"
        >
          <div className="glass rounded-xl p-6 h-full flex flex-col gap-4 transition-all duration-300 hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:scale-[1.01] cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                <FileText className="w-6 h-6 text-cyan-400" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/50 mt-1 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">Build Resume</h3>
              <p className="text-sm text-muted-foreground">
                Create or tailor your resume with AI assistance
              </p>
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {resumeLimitReached
                  ? "Limit reached"
                  : `${resumesLeft} of ${resumesLimit} remaining`}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="pointer-events-none"
              >
                {resumeLimitReached ? "Upgrade to Continue" : "Build Resume"}
              </Button>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* ── Section 4: Recent Activity ── */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent Activity</h2>
          {sessions.length > 0 && (
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
              <Link href="/history">
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          )}
        </div>

        <div className="glass rounded-xl overflow-hidden">
          {historyLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-10 ml-auto" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon={History}
              title="No interviews yet"
              description="Start your first mock interview to see your activity here."
              actionLabel="Start Interview"
              actionHref="/interview"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-muted-foreground">
                    <th className="text-left font-medium px-5 py-3">Type</th>
                    <th className="text-left font-medium px-5 py-3 hidden sm:table-cell">Topic</th>
                    <th className="text-left font-medium px-5 py-3 hidden md:table-cell">Difficulty</th>
                    <th className="text-left font-medium px-5 py-3">Score</th>
                    <th className="text-left font-medium px-5 py-3 hidden lg:table-cell">Status</th>
                    <th className="text-left font-medium px-5 py-3 hidden lg:table-cell">
                      <Clock className="w-3.5 h-3.5" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, i) => (
                    <tr
                      key={session.id}
                      onClick={() => window.location.href = "/history"}
                      className={cn(
                        "border-b border-white/5 last:border-0 hover:bg-white/3 cursor-pointer transition-colors",
                        i % 2 === 0 ? "" : "bg-white/1"
                      )}
                    >
                      <td className="px-5 py-3.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium",
                            TYPE_CLASS[session.type] ?? ""
                          )}
                        >
                          {TYPE_LABEL[session.type] ?? session.type}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell text-muted-foreground max-w-45 truncate">
                        {session.topic ?? session.problem?.topic ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs capitalize font-medium",
                            DIFF_CLASS[session.difficulty] ?? ""
                          )}
                        >
                          {session.difficulty}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-semibold">
                        {session.feedback?.overallScore != null ? (
                          <span
                            className={cn(
                              session.feedback.overallScore >= 80
                                ? "text-emerald-400"
                                : session.feedback.overallScore >= 60
                                ? "text-yellow-400"
                                : "text-red-400"
                            )}
                          >
                            {session.feedback.overallScore}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs capitalize font-medium",
                            STATUS_CLASS[session.status] ?? ""
                          )}
                        >
                          {session.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(session.startedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
