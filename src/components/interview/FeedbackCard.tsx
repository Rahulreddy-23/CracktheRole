"use client";

import { motion } from "framer-motion";
import { Check, TrendingUp } from "lucide-react";

interface FeedbackCardProps {
    summary: string;
    strengths: string[];
    improvements: string[];
}

export default function FeedbackCard({
    summary,
    strengths,
    improvements,
}: FeedbackCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-surface rounded-xl border border-border/40 p-5"
        >
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                Interviewer Feedback
            </h3>

            <p className="text-sm text-text-primary leading-relaxed mb-5">
                {summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="rounded-lg border-l-2 border-brand-success/60 pl-4 py-1">
                    <h4 className="text-xs font-semibold text-brand-success uppercase tracking-wide mb-2">
                        Strengths
                    </h4>
                    <ul className="space-y-2">
                        {strengths.map((item, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + i * 0.08 }}
                                className="flex items-start gap-2 text-sm text-text-primary"
                            >
                                <Check className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                                <span>{item}</span>
                            </motion.li>
                        ))}
                    </ul>
                </div>

                {/* Improvements */}
                <div className="rounded-lg border-l-2 border-amber-500/60 pl-4 py-1">
                    <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">
                        Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                        {improvements.map((item, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9 + i * 0.08 }}
                                className="flex items-start gap-2 text-sm text-text-primary"
                            >
                                <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                <span>{item}</span>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </div>
        </motion.div>
    );
}
