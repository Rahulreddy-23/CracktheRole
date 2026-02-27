"use client";

import { TrendingUp, TrendingDown, Calendar, Lightbulb } from "lucide-react";

interface Props {
  technical: number;
  communication: number;
  problemSolving: number;
  timeManagement: number;
  interviewsThisWeek: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  technical: "Technical",
  communication: "Communication",
  problemSolving: "Problem Solving",
  timeManagement: "Time Management",
};

const FOCUS_SUGGESTIONS: Record<string, string> = {
  technical: "Practice more DSA and system design problems",
  communication: "Work on structuring your answers using the STAR method",
  problemSolving: "Focus on breaking down complex problems step by step",
  timeManagement: "Practice timed mock interviews to build pace",
};

export default function InsightsCard({ technical, communication, problemSolving, timeManagement, interviewsThisWeek }: Props) {
  const scores: Record<string, number> = { technical, communication, problemSolving, timeManagement };
  const hasData = Object.values(scores).some((v) => v > 0);

  const strongest = hasData
    ? Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
    : null;
  const weakest = hasData
    ? Object.entries(scores).reduce((a, b) => (b[1] < a[1] ? b : a))[0]
    : null;

  return (
    <div className="rounded-xl border border-border/50 bg-surface/80 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Insights</h3>
        <p className="text-xs text-text-secondary mt-0.5">Personalized recommendations</p>
      </div>

      <div className="space-y-3">
        {/* Interviews this week */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-text-secondary">Interviews This Week</p>
            <p className="text-sm font-semibold text-text-primary">{interviewsThisWeek}</p>
          </div>
        </div>

        {/* Strongest area */}
        {strongest && scores[strongest] > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
            <div className="w-8 h-8 rounded-lg bg-brand-success/15 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-brand-success" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Strongest Area</p>
              <p className="text-sm font-semibold text-text-primary">
                {CATEGORY_LABELS[strongest]}
                <span className="text-text-secondary font-normal ml-1.5">
                  ({scores[strongest].toFixed(0)}/100)
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Needs most work */}
        {weakest && scores[weakest] > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
            <div className="w-8 h-8 rounded-lg bg-brand-warning/15 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4 text-brand-warning" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Needs Most Work</p>
              <p className="text-sm font-semibold text-text-primary">
                {CATEGORY_LABELS[weakest]}
                <span className="text-text-secondary font-normal ml-1.5">
                  ({scores[weakest].toFixed(0)}/100)
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Suggested focus */}
        {weakest && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/15 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 text-brand-primary-light" />
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-0.5">Suggested Focus</p>
              <p className="text-xs text-text-primary">{FOCUS_SUGGESTIONS[weakest]}</p>
            </div>
          </div>
        )}

        {!hasData && (
          <div className="text-center py-4 text-text-secondary/50 text-sm">
            Complete your first interview to unlock insights
          </div>
        )}
      </div>
    </div>
  );
}
