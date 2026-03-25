"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  History,
  Code2,
  Layers,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/page-header";
import EmptyState from "@/components/shared/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { getInterviewHistory } from "@/lib/db";
import { LANGUAGE_CONFIG } from "@/types";
import { cn } from "@/lib/utils";
import type { InterviewSession, InterviewFeedback } from "@/types";

// ── Firestore timestamp compat ────────────────────────────────────────────────

type FSDate = Date | { toDate?: () => Date; seconds?: number };

type HistorySession = Omit<InterviewSession, "startedAt" | "completedAt"> & {
  startedAt: FSDate;
  completedAt?: FSDate;
};

function toDate(v: FSDate | undefined): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof (v as { toDate?: () => Date }).toDate === "function")
    return (v as { toDate: () => Date }).toDate();
  if (typeof (v as { seconds?: number }).seconds === "number")
    return new Date((v as { seconds: number }).seconds * 1000);
  return null;
}

function relativeTime(v: FSDate | undefined): string {
  const d = toDate(v);
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── Style maps ───────────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, React.ElementType> = {
  coding: Code2,
  "system-design": Layers,
  behavioral: MessageSquare,
};

const TYPE_ICON_CLASS: Record<string, string> = {
  coding: "bg-blue-500/15 text-blue-400",
  "system-design": "bg-purple-500/15 text-purple-400",
  behavioral: "bg-teal-500/15 text-teal-400",
};

const DIFF_CLASS: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/15 text-red-400 border-red-500/30",
};

function scoreColor(s: number): string {
  if (s >= 71) return "text-emerald-400";
  if (s >= 41) return "text-yellow-400";
  return "text-red-400";
}

function scoreBorder(s: number): string {
  if (s >= 71) return "border-emerald-500/40";
  if (s >= 41) return "border-yellow-500/40";
  return "border-red-500/40";
}

// ── Animations ───────────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
};

// ── Filter types ─────────────────────────────────────────────────────────────

type TypeFilter = "all" | "coding" | "system-design" | "behavioral";
type DiffFilter = "all" | "easy" | "medium" | "hard";
type SortOrder = "date" | "score";

// ── Pill button ──────────────────────────────────────────────────────────────

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150",
        active
          ? "bg-primary/15 text-primary border-primary/40"
          : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

// ── Small score badge ────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  return (
    <div
      className={cn(
        "w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0",
        scoreBorder(score)
      )}
    >
      <span className={cn("text-sm font-bold tabular-nums", scoreColor(score))}>
        {score}
      </span>
    </div>
  );
}

// ── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 glass rounded-xl p-4">
      <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full" />
      <Skeleton className="w-11 h-11 rounded-full shrink-0" />
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [diffFilter, setDiffFilter] = useState<DiffFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("date");

  // Load
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    getInterviewHistory(user.uid, 50)
      .then((data) => setSessions(data as HistorySession[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter((s) => s.status === "completed");
    const scored = completed.filter((s) => s.feedback?.overallScore != null);
    const avgScore =
      scored.length > 0
        ? Math.round(
            scored.reduce(
              (acc, s) => acc + ((s.feedback as InterviewFeedback).overallScore),
              0
            ) / scored.length
          )
        : null;
    const completionRate =
      total > 0 ? Math.round((completed.length / total) * 100) : null;
    return { total, avgScore, completionRate };
  }, [sessions]);

  // ── Filtered + sorted list ─────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...sessions];
    if (typeFilter !== "all")
      list = list.filter((s) => s.type === typeFilter);
    if (diffFilter !== "all")
      list = list.filter((s) => s.difficulty === diffFilter);
    if (sortOrder === "score") {
      list.sort(
        (a, b) =>
          ((b.feedback as InterviewFeedback | undefined)?.overallScore ?? -1) -
          ((a.feedback as InterviewFeedback | undefined)?.overallScore ?? -1)
      );
    } else {
      list.sort((a, b) => {
        const da = toDate(a.startedAt)?.getTime() ?? 0;
        const db2 = toDate(b.startedAt)?.getTime() ?? 0;
        return db2 - da;
      });
    }
    return list;
  }, [sessions, typeFilter, diffFilter, sortOrder]);

  // ── Navigate on click ─────────────────────────────────────────────────────

  function handleCardClick(s: HistorySession) {
    if (s.status === "completed" && s.feedback) {
      router.push(`/interview/${s.id}/feedback`);
    } else {
      router.push(`/interview/${s.id}`);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <PageHeader
        title="Interview History"
        description="Review your past interviews and track your progress"
      />

      {/* ── Stats ── */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        {[
          {
            label: "Total Interviews",
            value: loading ? "—" : String(stats.total),
            icon: History,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Average Score",
            value:
              loading
                ? "—"
                : stats.avgScore !== null
                ? `${stats.avgScore}`
                : "—",
            sub: stats.avgScore !== null ? "/ 100" : "",
            icon: BarChart3,
            color:
              stats.avgScore === null
                ? "text-muted-foreground"
                : scoreColor(stats.avgScore),
            bg:
              stats.avgScore === null
                ? "bg-white/5"
                : stats.avgScore >= 71
                ? "bg-emerald-500/10"
                : stats.avgScore >= 41
                ? "bg-yellow-500/10"
                : "bg-red-500/10",
          },
          {
            label: "Completion Rate",
            value:
              loading
                ? "—"
                : stats.completionRate !== null
                ? `${stats.completionRate}%`
                : "—",
            icon: TrendingUp,
            color:
              stats.completionRate === null
                ? "text-muted-foreground"
                : stats.completionRate >= 70
                ? "text-emerald-400"
                : "text-yellow-400",
            bg: "bg-white/5",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass rounded-xl p-5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </p>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", stat.bg)}>
                  <Icon className={cn("w-3.5 h-3.5", stat.color)} />
                </div>
              </div>
              <div className="flex items-end gap-1">
                <span className={cn("text-3xl font-bold tabular-nums", stat.color)}>
                  {loading ? (
                    <Skeleton className="h-8 w-10 inline-block rounded" />
                  ) : (
                    stat.value
                  )}
                </span>
                {stat.sub && (
                  <span className="text-sm text-muted-foreground mb-0.5">{stat.sub}</span>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── Filter bar ── */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex flex-wrap gap-3 items-center mb-6"
      >
        {/* Type filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "coding", "system-design", "behavioral"] as TypeFilter[]).map(
            (t) => (
              <Pill
                key={t}
                active={typeFilter === t}
                onClick={() => setTypeFilter(t)}
              >
                {t === "all"
                  ? "All Types"
                  : t === "coding"
                  ? "Coding"
                  : t === "system-design"
                  ? "System Design"
                  : "Behavioral"}
              </Pill>
            )
          )}
        </div>

        <div className="w-px h-5 bg-white/10 hidden sm:block" />

        {/* Difficulty filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "easy", "medium", "hard"] as DiffFilter[]).map((d) => (
            <Pill
              key={d}
              active={diffFilter === d}
              onClick={() => setDiffFilter(d)}
            >
              {d === "all" ? "All Difficulties" : d.charAt(0).toUpperCase() + d.slice(1)}
            </Pill>
          ))}
        </div>

        <div className="sm:ml-auto flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <Pill
            active={sortOrder === "date"}
            onClick={() => setSortOrder("date")}
          >
            Newest first
          </Pill>
          <Pill
            active={sortOrder === "score"}
            onClick={() => setSortOrder("score")}
          >
            Highest score
          </Pill>
        </div>
      </motion.div>

      {/* ── List ── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        sessions.length === 0 ? (
          <EmptyState
            icon={History}
            title="No interviews yet"
            description="Start a mock interview to track your progress here."
            actionLabel="Start Interview"
            actionHref="/interview"
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No interviews match the current filters.
          </div>
        )
      ) : (
        <div className="space-y-2.5">
          {filtered.map((s, i) => {
            const TypeIcon = TYPE_ICON[s.type] ?? Code2;
            const langName =
              s.type === "coding" && s.language
                ? (LANGUAGE_CONFIG[s.language as keyof typeof LANGUAGE_CONFIG]
                    ?.name ?? s.language)
                : null;

            const score =
              s.status === "completed" && s.feedback
                ? (s.feedback as InterviewFeedback).overallScore
                : null;

            return (
              <motion.div
                key={s.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <button
                  className="w-full text-left glass rounded-xl border border-white/10 px-4 py-3.5 flex items-center gap-4 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-150 group"
                  onClick={() => handleCardClick(s)}
                >
                  {/* Type icon */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      TYPE_ICON_CLASS[s.type]
                    )}
                  >
                    <TypeIcon className="w-4.5 h-4.5" />
                  </div>

                  {/* Topic + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate leading-snug">
                      {s.problem?.title ?? s.topic}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] capitalize", DIFF_CLASS[s.difficulty])}
                      >
                        {s.difficulty}
                      </Badge>
                      {langName && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-white/10 text-muted-foreground"
                        >
                          {langName}
                        </Badge>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {relativeTime(s.startedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Status / score */}
                  <div className="shrink-0 flex items-center gap-3">
                    {score !== null ? (
                      <ScoreBadge score={score} />
                    ) : s.status === "abandoned" ? (
                      <Badge
                        variant="outline"
                        className="text-xs border-zinc-500/30 text-zinc-400 bg-zinc-500/10"
                      >
                        Abandoned
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/10"
                      >
                        In Progress
                      </Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}
