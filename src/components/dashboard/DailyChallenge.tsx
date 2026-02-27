"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DailyChallengeProps {
    challenge: {
        id: string;
        title: string;
        description: string;
        difficulty: "easy" | "medium" | "hard";
        category: string;
    } | null;
    isCompleted: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
    easy: "bg-brand-success/15 text-brand-success border-brand-success/30",
    medium: "bg-brand-warning/15 text-brand-warning border-brand-warning/30",
    hard: "bg-brand-danger/15 text-brand-danger border-brand-danger/30",
};

export default function DailyChallenge({
    challenge,
    isCompleted,
}: DailyChallengeProps) {
    const [expanded, setExpanded] = useState(false);

    if (!challenge) {
        return (
            <div className="rounded-xl border border-border/50 bg-surface p-5">
                <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-text-secondary/50" />
                    <h3 className="text-sm font-semibold text-text-primary">
                        Today&apos;s Challenge
                    </h3>
                </div>
                <p className="text-sm text-text-secondary/60">
                    No challenge available today. Check back tomorrow!
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative rounded-xl border border-brand-primary/30 bg-surface overflow-hidden"
        >
            {/* Gradient border effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-primary/50 to-transparent" />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-primary-light" />
                        <h3 className="text-sm font-semibold text-text-primary">
                            Today&apos;s Challenge
                        </h3>
                    </div>

                    {isCompleted && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-success/15 border border-brand-success/30">
                            <Check className="w-3 h-3 text-brand-success" strokeWidth={3} />
                            <span className="text-xs font-semibold text-brand-success">
                                Completed
                            </span>
                        </div>
                    )}
                </div>

                {/* Question title and badges */}
                <h4 className="text-base font-medium text-text-primary mb-2">
                    {challenge.title}
                </h4>
                <div className="flex items-center gap-2 mb-3">
                    <Badge
                        variant="outline"
                        className={`text-xs ${DIFFICULTY_COLORS[challenge.difficulty]}`}
                    >
                        {challenge.difficulty}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="text-xs border-border/50 text-text-secondary"
                    >
                        {challenge.category.replace("_", " ")}
                    </Badge>
                </div>

                {/* Expand/collapse button */}
                {!isCompleted && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="w-full border-border/50 text-text-secondary hover:text-text-primary bg-transparent gap-2 text-xs h-8"
                    >
                        {expanded ? "Hide Details" : "Solve Now"}
                        <ChevronDown
                            className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                        />
                    </Button>
                )}

                {/* Collapsible description */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <p className="text-sm text-text-secondary leading-relaxed mt-3 pt-3 border-t border-border/40">
                                {challenge.description}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
