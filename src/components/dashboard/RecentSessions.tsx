"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ExternalLink, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Session {
    id: string;
    interview_type: string;
    company_context: string | null;
    overall_score: number | null;
    created_at: string;
    duration_seconds: number | null;
}

interface RecentSessionsProps {
    sessions: Session[];
}

const TYPE_LABELS: Record<string, string> = {
    dsa: "DSA",
    system_design: "System Design",
    behavioral: "Behavioral",
    sql: "SQL",
};

const TYPE_COLORS: Record<string, string> = {
    dsa: "bg-brand-primary/15 text-brand-primary-light border-brand-primary/30",
    system_design: "bg-brand-secondary/15 text-brand-secondary border-brand-secondary/30",
    behavioral: "bg-brand-warning/15 text-brand-warning border-brand-warning/30",
    sql: "bg-brand-success/15 text-brand-success border-brand-success/30",
};

function getScoreColor(score: number | null): string {
    if (score === null) return "text-text-secondary/40";
    if (score > 70) return "text-brand-success";
    if (score > 40) return "text-brand-warning";
    return "text-brand-danger";
}

function formatDuration(seconds: number | null): string {
    if (!seconds) return "--";
    const mins = Math.round(seconds / 60);
    return `${mins}m`;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

const rowVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, x: -12 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1],
            delay: i * 0.06,
        },
    }),
};

export default function RecentSessions({ sessions }: RecentSessionsProps) {
    if (sessions.length === 0) {
        return (
            <div className="rounded-xl border border-border/50 bg-surface p-6 text-center">
                <MessageSquare className="w-10 h-10 text-text-secondary/20 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-text-primary mb-1">
                    No interviews yet
                </h3>
                <p className="text-xs text-text-secondary/60 mb-4">
                    Take your first mock interview to see your results here.
                </p>
                <Button
                    asChild
                    size="sm"
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs h-8 px-4"
                >
                    <Link href="/interview/setup">Take Your First Interview</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/50 bg-surface overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
                <h3 className="text-sm font-semibold text-text-primary">
                    Recent Sessions
                </h3>
                <Link
                    href="/progress"
                    className="text-xs text-brand-primary-light hover:underline"
                >
                    View All
                </Link>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/30">
                {sessions.map((session, i) => (
                    <motion.div
                        key={session.id}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex items-center gap-3 px-5 py-3 hover:bg-surface2/50 transition-colors duration-150"
                    >
                        {/* Type badge */}
                        <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 ${TYPE_COLORS[session.interview_type] || "border-border/50 text-text-secondary"}`}
                        >
                            {TYPE_LABELS[session.interview_type] || session.interview_type}
                        </Badge>

                        {/* Company */}
                        <span className="text-sm text-text-secondary truncate flex-1 min-w-0">
                            {session.company_context || "General"}
                        </span>

                        {/* Score */}
                        <span
                            className={`text-sm font-bold tabular-nums shrink-0 ${getScoreColor(session.overall_score)}`}
                        >
                            {session.overall_score !== null
                                ? `${session.overall_score}%`
                                : "--"}
                        </span>

                        {/* Duration */}
                        <span className="text-xs text-text-secondary/50 shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(session.duration_seconds)}
                        </span>

                        {/* Date */}
                        <span className="text-xs text-text-secondary/50 shrink-0 w-16 text-right">
                            {formatDate(session.created_at)}
                        </span>

                        {/* Details link */}
                        <Link
                            href={`/interview/review/${session.id}`}
                            className="text-text-secondary/40 hover:text-brand-primary-light transition-colors shrink-0"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
