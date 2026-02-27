"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/components/providers/user-provider";

export default function WelcomeBanner() {
    const { profile } = useUserContext();
    const firstName = profile?.full_name?.split(" ")[0] || "there";
    const streak = profile?.streak_count ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl border border-brand-primary/20 overflow-hidden p-6 sm:p-8"
            style={{
                background:
                    "linear-gradient(135deg, rgba(108,60,225,0.15) 0%, transparent 60%), #1A1A2E",
            }}
        >
            {/* Subtle top glow */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-linear-to-r from-transparent via-brand-primary/40 to-transparent" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
                        Welcome back, {firstName}
                    </h1>

                    {/* Streak display */}
                    <div className="flex items-center gap-2 mt-2">
                        <Flame
                            className={`w-5 h-5 ${streak > 0 ? "text-orange-400" : "text-text-secondary/40"}`}
                        />
                        {streak > 0 ? (
                            <span className="text-sm font-medium text-text-secondary">
                                <AnimatedCounter value={streak} /> day streak
                            </span>
                        ) : (
                            <span className="text-sm text-text-secondary/60">
                                Start your streak today!
                            </span>
                        )}
                    </div>
                </div>

                <Button
                    asChild
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium gap-2 px-5 h-10 shadow-lg shadow-brand-primary/20 shrink-0"
                >
                    <Link href="/interview/setup">
                        Quick Start
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>
            </div>
        </motion.div>
    );
}

// Animated number counter
function AnimatedCounter({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let frame: number;
        const duration = 600;
        const start = performance.now();

        function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        }

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [value]);

    return <span className="text-orange-400 font-bold">{display}</span>;
}
