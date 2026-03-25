"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  LayoutDashboard,
  Share2,
  TrendingUp,
  Zap,
  MessageSquare,
  Clock,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { InterviewFeedback, InterviewProblem } from "@/types";
import { cn } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 71) return "#22c55e"; // green-500
  if (score >= 41) return "#eab308"; // yellow-500
  return "#ef4444"; // red-500
}

function scoreLabel(score: number): string {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Adequate";
  if (score >= 45) return "Needs Work";
  return "Significant Gaps";
}

function scoreBg(score: number): string {
  if (score >= 71) return "text-emerald-400";
  if (score >= 41) return "text-yellow-400";
  return "text-red-400";
}

const SEVERITY_STYLES: Record<string, string> = {
  minor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  major: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
};

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ElementType; desc: string }
> = {
  problemSolving: {
    label: "Problem Solving",
    icon: Zap,
    desc: "Algorithm & approach",
  },
  codeQuality: {
    label: "Code Quality",
    icon: TrendingUp,
    desc: "Structure & readability",
  },
  communication: {
    label: "Communication",
    icon: MessageSquare,
    desc: "Clarity of thought process",
  },
  timeComplexity: {
    label: "Complexity",
    icon: Clock,
    desc: "Time & space analysis",
  },
  edgeCases: {
    label: "Edge Cases",
    icon: Shield,
    desc: "Robustness & coverage",
  },
};

// ── Animated circular score ───────────────────────────────────────────────────

function ScoreCircle({ target }: { target: number }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const DURATION = 1400; // ms

  useEffect(() => {
    startRef.current = null;

    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / DURATION, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  const color = scoreColor(target);
  const deg = (displayed / 100) * 360;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ring using conic-gradient */}
      <div
        className="w-36 h-36 rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(${color} ${deg}deg, rgba(255,255,255,0.06) ${deg}deg)`,
          padding: "6px",
        }}
      >
        {/* Inner circle */}
        <div className="w-full h-full rounded-full bg-background flex flex-col items-center justify-center gap-0.5">
          <span
            className="text-4xl font-bold tabular-nums leading-none"
            style={{ color }}
          >
            {displayed}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>

      {/* Label below */}
      <div className="absolute -bottom-7 text-center">
        <span
          className="text-xs font-semibold"
          style={{ color }}
        >
          {scoreLabel(target)}
        </span>
      </div>
    </div>
  );
}

// ── Category bar ─────────────────────────────────────────────────────────────

function CategoryBar({
  categoryKey,
  score,
  feedback,
}: {
  categoryKey: string;
  score: number;
  feedback: string;
}) {
  const [width, setWidth] = useState(0);
  const meta = CATEGORY_META[categoryKey] ?? {
    label: categoryKey,
    icon: TrendingUp,
    desc: "",
  };
  const Icon = meta.icon;
  const color = scoreColor(score);

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 80);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium">{meta.label}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {meta.desc}
          </span>
        </div>
        <span
          className="text-sm font-bold tabular-nums shrink-0"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{feedback}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface FeedbackViewProps {
  feedback: InterviewFeedback;
  problem: InterviewProblem;
  type: string;
  sessionId: string;
}

const STAGGER = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function FeedbackView({
  feedback,
  problem,
  type,
  sessionId,
}: FeedbackViewProps) {
  const categories = Object.entries(feedback.categories) as [
    keyof typeof feedback.categories,
    { score: number; feedback: string }
  ][];

  function handleShare() {
    const text = [
      `CrackTheRole Interview Results`,
      `Problem: ${problem.title} (${problem.difficulty})`,
      `Overall Score: ${feedback.overallScore}/100`,
      ``,
      `Categories:`,
      ...categories.map(
        ([k, v]) =>
          `  ${CATEGORY_META[k]?.label ?? k}: ${v.score}/100`
      ),
      ``,
      `Strengths: ${feedback.strengths.slice(0, 2).join(" • ")}`,
    ].join("\n");

    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Results copied to clipboard!"))
      .catch(() => toast.error("Could not copy to clipboard"));
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* ── Header ── */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={STAGGER}
        className="text-center space-y-1"
      >
        <h1 className="text-2xl font-bold">Interview Complete</h1>
        <p className="text-muted-foreground text-sm">
          {problem.title} · {problem.difficulty} · {type}
        </p>
      </motion.div>

      {/* ── Score + category grid ── */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={STAGGER}
        className="glass rounded-2xl border border-white/10 p-6"
      >
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          {/* Circle */}
          <div className="shrink-0 flex flex-col items-center self-center sm:self-auto pt-4 pb-10 sm:pb-4 sm:pr-6 sm:border-r sm:border-white/10">
            <ScoreCircle target={feedback.overallScore} />
            <p className="text-xs text-muted-foreground mt-10 sm:mt-10">
              Overall Score
            </p>
          </div>

          {/* Category bars */}
          <div className="flex-1 space-y-5 min-w-0 w-full">
            {categories.map(([key, val]) => (
              <CategoryBar
                key={key}
                categoryKey={key}
                score={val.score}
                feedback={val.feedback}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Strengths + Improvements ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={STAGGER}
          className="glass rounded-xl border border-emerald-500/20 p-5 space-y-3"
        >
          <h2 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Strengths
          </h2>
          <ul className="space-y-2">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-foreground/80">{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={STAGGER}
          className="glass rounded-xl border border-yellow-500/20 p-5 space-y-3"
        >
          <h2 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Areas to Improve
          </h2>
          <ul className="space-y-2">
            {feedback.improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                <span className="text-foreground/80">{imp}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ── Mistakes log ── */}
      {feedback.mistakesLog.length > 0 && (
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={STAGGER}
          className="glass rounded-xl border border-white/10 p-5 space-y-3"
        >
          <h2 className="text-sm font-semibold text-foreground/80">
            Mistakes &amp; Corrections
          </h2>
          <Accordion type="multiple" className="space-y-1">
            {feedback.mistakesLog.map((item, i) => (
              <AccordionItem
                key={i}
                value={`m-${i}`}
                className="border border-white/10 rounded-lg px-3 not-last:border-b not-last:border-white/10"
              >
                <AccordionTrigger className="text-sm hover:no-underline py-2.5 gap-3">
                  <div className="flex items-center gap-2 text-left flex-1 min-w-0">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] capitalize shrink-0",
                        SEVERITY_STYLES[item.severity]
                      )}
                    >
                      {item.severity}
                    </Badge>
                    <span className="text-foreground/80 truncate">
                      {item.mistake}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3 space-y-2">
                  <div className="text-xs space-y-1">
                    <p className="text-muted-foreground font-medium">
                      Mistake:
                    </p>
                    <p className="text-foreground/80">{item.mistake}</p>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="text-emerald-400 font-medium">Correction:</p>
                    <p className="text-foreground/80">{item.correction}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      )}

      {/* ── Summary ── */}
      <motion.div
        custom={5}
        initial="hidden"
        animate="visible"
        variants={STAGGER}
        className="glass rounded-xl border border-white/10 p-6 relative overflow-hidden"
      >
        {/* Decorative quote mark */}
        <span
          className="absolute -top-2 left-4 text-7xl font-serif text-white/4 leading-none select-none"
          aria-hidden
        >
          &ldquo;
        </span>
        <h2 className="text-sm font-semibold text-foreground/60 mb-3 relative">
          Interviewer&apos;s Assessment
        </h2>
        <p className="text-sm leading-relaxed text-foreground/80 relative whitespace-pre-line">
          {feedback.summary}
        </p>
      </motion.div>

      {/* ── Actions ── */}
      <motion.div
        custom={6}
        initial="hidden"
        animate="visible"
        variants={STAGGER}
        className="flex flex-wrap gap-3 justify-end"
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-white/15"
          onClick={handleShare}
        >
          <Share2 className="w-3.5 h-3.5" />
          Share Results
        </Button>
        <Button variant="outline" size="sm" className="gap-2 border-white/15" asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </Button>
        <Button size="sm" className="gap-2" asChild>
          <Link href="/interview">
            Try Again
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
