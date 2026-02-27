"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CategoryScore {
    label: string;
    score: number;
}

interface CategoryScoresProps {
    scores: CategoryScore[];
}

function getBarColor(score: number): string {
    if (score > 70) return "#10B981";
    if (score > 40) return "#F59E0B";
    return "#EF4444";
}

export default function CategoryScores({ scores }: CategoryScoresProps) {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-surface rounded-xl border border-border/40 p-5">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                Category Scores
            </h3>
            <div className="space-y-4">
                {scores.map((category, i) => {
                    const color = getBarColor(category.score);
                    return (
                        <motion.div
                            key={category.label}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm text-text-primary">
                                    {category.label}
                                </span>
                                <span
                                    className="text-sm font-semibold tabular-nums"
                                    style={{ color }}
                                >
                                    {category.score}/100
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-border/20 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: color }}
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: animated ? `${category.score}%` : 0,
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        delay: 0.5 + i * 0.1,
                                        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                                    }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
