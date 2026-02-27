"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Target, Calendar, TrendingUp } from "lucide-react";

// -- Helpers ------------------------------------------------------------------

const ROLE_LABELS: Record<string, string> = {
    data_engineer: "Data Engineer",
    backend_swe: "Backend SWE",
    frontend_swe: "Frontend SWE",
    ml_engineer: "ML Engineer",
    devops_sre: "DevOps / SRE",
    full_stack: "Full Stack",
};

const TIMELINE_LABELS: Record<string, string> = {
    "1_month": "1 month",
    "3_months": "3 months",
    "6_months": "6 months",
    "12_months": "12 months",
};

interface Phase {
    title: string;
    description: string;
    weeks: string;
}

function getPhases(timeline: string): Phase[] {
    const isShort = timeline === "1_month";

    if (isShort) {
        return [
            {
                title: "Foundations",
                description: "Core DSA, SQL, and language fundamentals",
                weeks: "Week 1-2",
            },
            {
                title: "System Design + Company Prep",
                description: "Architecture patterns and targeted interview questions",
                weeks: "Week 2-3",
            },
            {
                title: "Mock Interviews + Behavioral",
                description: "Full practice sessions and communication drills",
                weeks: "Week 3-4",
            },
        ];
    }

    const totalMonths =
        timeline === "3_months"
            ? 3
            : timeline === "6_months"
                ? 6
                : 12;

    const phaseWeeks = Math.floor((totalMonths * 4) / 3);

    return [
        {
            title: "Foundations",
            description: "SQL, Python, Core DSA patterns and problem solving",
            weeks: `Week 1-${phaseWeeks}`,
        },
        {
            title: "System Design + Company-Specific Questions",
            description: "Architecture, scalability, and targeted prep material",
            weeks: `Week ${phaseWeeks + 1}-${phaseWeeks * 2}`,
        },
        {
            title: "Mock Interviews + Behavioral Prep",
            description: "Full AI interviews, communication, and final reviews",
            weeks: `Week ${phaseWeeks * 2 + 1}-${phaseWeeks * 3}`,
        },
    ];
}

// -- Animation ----------------------------------------------------------------

const containerVariants: import("framer-motion").Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
};

const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
};

// -- Component ----------------------------------------------------------------

interface PrepPlanPreviewProps {
    targetRole: string;
    targetCompanies: string[];
    currentCtc: number;
    targetCtc: number;
    prepTimeline: string;
}

export default function PrepPlanPreview({
    targetRole,
    targetCompanies,
    currentCtc,
    targetCtc,
    prepTimeline,
}: PrepPlanPreviewProps) {
    const phases = getPhases(prepTimeline);
    const roleLabel = ROLE_LABELS[targetRole] || targetRole;
    const timelineLabel = TIMELINE_LABELS[prepTimeline] || prepTimeline;
    const companyText =
        targetCompanies.length > 2
            ? `${targetCompanies.slice(0, 2).join(", ")} +${targetCompanies.length - 2} more`
            : targetCompanies.join(", ");

    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center mb-2">
                Your Personalized Prep Plan
            </h2>
            <p className="text-text-secondary text-center mb-8 text-sm">
                Here is what your preparation journey looks like.
            </p>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-lg mx-auto flex flex-col gap-4"
            >
                {/* Summary badges */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center justify-center gap-3 mb-2"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-sm font-medium text-brand-primary-light">
                        <Target className="w-3.5 h-3.5" />
                        {roleLabel}
                    </div>
                    {companyText && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-secondary/10 border border-brand-secondary/30 text-sm font-medium text-brand-secondary">
                            {companyText}
                        </div>
                    )}
                </motion.div>

                {/* CTC and Timeline cards */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-3"
                >
                    <div className="rounded-xl border border-border/50 bg-surface p-4 text-center">
                        <TrendingUp className="w-5 h-5 text-brand-success mx-auto mb-2" />
                        <p className="text-xs text-text-secondary mb-1">Target Jump</p>
                        <p className="text-sm font-bold text-text-primary">
                            {currentCtc} LPA <ArrowRight className="inline w-3 h-3 mx-1 text-text-secondary" /> {targetCtc} LPA
                        </p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-surface p-4 text-center">
                        <Calendar className="w-5 h-5 text-brand-warning mx-auto mb-2" />
                        <p className="text-xs text-text-secondary mb-1">Timeline</p>
                        <p className="text-sm font-bold text-text-primary">
                            {timelineLabel}
                        </p>
                    </div>
                </motion.div>

                {/* Prep phases */}
                <motion.div variants={itemVariants}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary/60 mb-3 text-center">
                        Weekly Schedule
                    </p>
                    <div className="flex flex-col gap-3">
                        {phases.map((phase, i) => (
                            <motion.div
                                key={phase.title}
                                variants={itemVariants}
                                className="flex items-start gap-4 rounded-xl border border-border/50 bg-surface p-4 group hover:border-brand-primary/30 transition-colors duration-200"
                            >
                                <div className="w-9 h-9 rounded-lg bg-brand-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                                    <Check
                                        className="w-4 h-4 text-brand-primary-light"
                                        strokeWidth={2.5}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h4 className="text-sm font-semibold text-text-primary">
                                            Phase {i + 1}: {phase.title}
                                        </h4>
                                        <span className="text-xs text-text-secondary/60 shrink-0">
                                            {phase.weeks}
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        {phase.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
