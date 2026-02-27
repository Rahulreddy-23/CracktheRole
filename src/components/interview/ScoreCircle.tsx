"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScoreCircleProps {
    score: number;
    size?: number;
}

function getScoreColor(score: number): string {
    if (score > 70) return "#10B981";
    if (score > 40) return "#F59E0B";
    return "#EF4444";
}

function getGradeLabel(score: number): string {
    if (score > 80) return "Excellent";
    if (score > 60) return "Good";
    if (score > 40) return "Needs Work";
    return "Keep Practicing";
}

export default function ScoreCircle({ score, size = 180 }: ScoreCircleProps) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const color = getScoreColor(score);
    const grade = getGradeLabel(score);

    // Animate the number counter
    useEffect(() => {
        if (score <= 0) return;
        const duration = 1200;
        const steps = 60;
        const increment = score / steps;
        let current = 0;
        const interval = setInterval(() => {
            current += increment;
            if (current >= score) {
                setAnimatedScore(score);
                clearInterval(interval);
            } else {
                setAnimatedScore(Math.round(current));
            }
        }, duration / steps);
        return () => clearInterval(interval);
    }, [score]);

    const offset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background ring */}
                <svg width={size} height={size} className="absolute inset-0">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(148,163,184,0.1)"
                        strokeWidth={strokeWidth}
                    />
                </svg>

                {/* Animated progress ring */}
                <motion.svg
                    width={size}
                    height={size}
                    className="absolute inset-0"
                    style={{ transform: "rotate(-90deg)" }}
                >
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        initial={{ strokeDashoffset: circumference }}
                        style={{
                            filter: `drop-shadow(0 0 6px ${color}40)`,
                        }}
                    />
                </motion.svg>

                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="text-4xl font-bold tabular-nums"
                        style={{ color }}
                    >
                        {animatedScore}
                    </span>
                    <span className="text-xs text-text-secondary mt-0.5">/ 100</span>
                </div>
            </div>

            <span
                className="text-sm font-semibold tracking-wide"
                style={{ color }}
            >
                {grade}
            </span>
        </div>
    );
}
