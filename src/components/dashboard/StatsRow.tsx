"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    MessageSquare,
    Target,
    BookOpen,
    TrendingUp,
    type LucideIcon,
} from "lucide-react";

interface StatItem {
    icon: LucideIcon;
    label: string;
    value: number;
    suffix?: string;
    color: string;
}

interface StatsRowProps {
    totalInterviews: number;
    averageScore: number;
    questionsPracticed: number;
}

const containerVariants: import("framer-motion").Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
};

const cardVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
};

export default function StatsRow({
    totalInterviews,
    averageScore,
    questionsPracticed,
}: StatsRowProps) {
    const stats: StatItem[] = [
        {
            icon: MessageSquare,
            label: "Total Interviews",
            value: totalInterviews,
            color: "rgba(108,60,225,0.15)",
        },
        {
            icon: Target,
            label: "Average Score",
            value: averageScore,
            suffix: "%",
            color: "rgba(16,185,129,0.12)",
        },
        {
            icon: BookOpen,
            label: "Questions Practiced",
            value: questionsPracticed,
            color: "rgba(6,182,212,0.12)",
        },
        {
            icon: TrendingUp,
            label: "Current Rank",
            value: 15,
            suffix: "%",
            color: "rgba(245,158,11,0.12)",
        },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
            {stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
            ))}
        </motion.div>
    );
}

function StatCard({ stat }: { stat: StatItem }) {
    const Icon = stat.icon;
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let frame: number;
        const duration = 700;
        const start = performance.now();

        function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * stat.value));
            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        }

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [stat.value]);

    const isRank = stat.label === "Current Rank";

    return (
        <motion.div
            variants={cardVariants}
            className="relative rounded-xl border border-border/50 bg-surface/80 backdrop-blur-sm p-5 overflow-hidden group hover:border-border transition-colors duration-200"
        >
            {/* Subtle background accent */}
            <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at top right, ${stat.color}, transparent 70%)`,
                }}
            />

            <div className="relative z-10">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: stat.color }}
                >
                    <Icon className="w-4 h-4 text-text-primary" strokeWidth={1.75} />
                </div>

                <p className="text-xs text-text-secondary font-medium mb-1">
                    {stat.label}
                </p>
                <p className="text-2xl font-bold text-text-primary">
                    {isRank ? "Top " : ""}
                    {display}
                    {stat.suffix || ""}
                </p>
            </div>
        </motion.div>
    );
}
