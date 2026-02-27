"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    RotateCcw,
    Share2,
    LayoutDashboard,
    Calendar,
    Clock,
    Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScoreCircle from "@/components/interview/ScoreCircle";
import CategoryScores from "@/components/interview/CategoryScores";
import FeedbackCard from "@/components/interview/FeedbackCard";
import ConversationReplay from "@/components/interview/ConversationReplay";

const TYPE_LABELS: Record<string, string> = {
    dsa: "DSA / Algorithms",
    system_design: "System Design",
    behavioral: "Behavioral / HR",
    sql: "SQL / Data",
};

const TYPE_BADGE_COLORS: Record<string, string> = {
    dsa: "bg-brand-primary/15 text-brand-primary-light border-brand-primary/30",
    system_design: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    behavioral: "bg-brand-success/15 text-brand-success border-brand-success/30",
    sql: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const DIFFICULTY_BADGE_COLORS: Record<string, string> = {
    easy: "bg-brand-success/15 text-brand-success border-brand-success/30",
    medium: "bg-brand-warning/15 text-brand-warning border-brand-warning/30",
    hard: "bg-brand-danger/15 text-brand-danger border-brand-danger/30",
};

interface SessionData {
    id: string;
    interview_type: "dsa" | "system_design" | "behavioral" | "sql";
    difficulty: "easy" | "medium" | "hard";
    company_context: string | null;
    overall_score: number | null;
    score_technical: number | null;
    score_communication: number | null;
    score_problem_solving: number | null;
    score_time_management: number | null;
    feedback_summary: string | null;
    strengths: string[] | null;
    improvements: string[] | null;
    messages: unknown;
    duration_seconds: number | null;
    created_at: string;
    completed_at: string | null;
    status: string;
}

interface ReviewContentProps {
    session: SessionData;
}

function formatDuration(seconds: number | null): string {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function ReviewContent({ session }: ReviewContentProps) {
    const router = useRouter();

    const overallScore = session.overall_score ?? 0;

    const categoryScores = [
        {
            label: "Technical Accuracy",
            score: session.score_technical ?? 0,
        },
        {
            label: "Communication Clarity",
            score: session.score_communication ?? 0,
        },
        {
            label: "Problem Solving",
            score: session.score_problem_solving ?? 0,
        },
        {
            label: "Time Management",
            score: session.score_time_management ?? 0,
        },
    ];

    const messages = Array.isArray(session.messages)
        ? (session.messages as Array<{ role: "user" | "assistant"; content: string }>)
        : [];

    function handlePracticeAgain() {
        router.push("/interview/setup");
    }

    function handleShareScore() {
        const typeLabel = TYPE_LABELS[session.interview_type] || session.interview_type;
        const companyLabel = session.company_context || "General";
        const text = `I scored ${overallScore}/100 on a ${typeLabel} interview at ${companyLabel} on CrackTheRole! cracktherole.com`;
        navigator.clipboard.writeText(text).then(() => {
            toast.success("Score copied to clipboard!");
        });
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back button */}
            <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6"
            >
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/dashboard")}
                    className="text-text-secondary hover:text-text-primary gap-1.5 -ml-2 h-8 text-xs"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Dashboard
                </Button>
            </motion.div>

            {/* Section 1 - Overall Score Banner */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface rounded-xl border border-border/40 p-6 mb-5"
            >
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <ScoreCircle score={overallScore} />

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-xl font-bold text-text-primary mb-3">
                            Interview Scorecard
                        </h1>

                        <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-3">
                            <Badge
                                variant="outline"
                                className={`text-[10px] ${TYPE_BADGE_COLORS[session.interview_type] || ""}`}
                            >
                                {TYPE_LABELS[session.interview_type] || session.interview_type}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`text-[10px] ${DIFFICULTY_BADGE_COLORS[session.difficulty] || ""}`}
                            >
                                {session.difficulty}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary justify-center md:justify-start">
                            {session.company_context && (
                                <span className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {session.company_context}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(session.duration_seconds)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(session.created_at)}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Section 2 - Category Scores */}
            <div className="mb-5">
                <CategoryScores scores={categoryScores} />
            </div>

            {/* Section 3 - AI Feedback */}
            {session.feedback_summary && (
                <div className="mb-5">
                    <FeedbackCard
                        summary={session.feedback_summary}
                        strengths={session.strengths ?? []}
                        improvements={session.improvements ?? []}
                    />
                </div>
            )}

            {/* Section 4 - Conversation Replay */}
            <div className="mb-6">
                <ConversationReplay messages={messages} />
            </div>

            {/* Section 5 - Actions */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-3"
            >
                <Button
                    onClick={handlePracticeAgain}
                    className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white gap-2 h-10"
                >
                    <RotateCcw className="w-4 h-4" />
                    Practice Again
                </Button>
                <Button
                    onClick={handleShareScore}
                    variant="outline"
                    className="flex-1 border-border/50 text-text-secondary hover:text-text-primary bg-transparent gap-2 h-10"
                >
                    <Share2 className="w-4 h-4" />
                    Share Score
                </Button>
                <Button
                    onClick={() => router.push("/dashboard")}
                    variant="ghost"
                    className="flex-1 text-text-secondary hover:text-text-primary gap-2 h-10"
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                </Button>
            </motion.div>
        </div>
    );
}
