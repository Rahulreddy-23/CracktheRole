"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Code,
    Network,
    Users,
    Database,
    ArrowRight,
    Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUserContext } from "@/components/providers/user-provider";
import { createClient } from "@/lib/supabase/client";
import { useInterviewStore } from "@/stores/interview-store";
import type { InterviewType, InterviewDifficulty } from "@/types/interview";

const INTERVIEW_TYPES = [
    {
        value: "dsa" as const,
        label: "DSA / Algorithms",
        icon: Code,
        color: "rgba(108,60,225,0.15)",
        borderColor: "border-brand-primary/50",
        textColor: "text-brand-primary-light",
    },
    {
        value: "system_design" as const,
        label: "System Design",
        icon: Network,
        color: "rgba(6,182,212,0.15)",
        borderColor: "border-cyan-500/50",
        textColor: "text-cyan-400",
    },
    {
        value: "behavioral" as const,
        label: "Behavioral / HR",
        icon: Users,
        color: "rgba(16,185,129,0.15)",
        borderColor: "border-brand-success/50",
        textColor: "text-brand-success",
    },
    {
        value: "sql" as const,
        label: "SQL / Data",
        icon: Database,
        color: "rgba(245,158,11,0.15)",
        borderColor: "border-amber-500/50",
        textColor: "text-amber-400",
    },
];

const DIFFICULTIES: { value: InterviewDifficulty; label: string }[] = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
];

const DURATIONS = [
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
];

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: i * 0.06 },
    }),
};

export default function InterviewSetup() {
    const router = useRouter();
    const { profile } = useUserContext();
    const setSession = useInterviewStore((s) => s.setSession);
    const resetStore = useInterviewStore((s) => s.reset);

    const [interviewType, setInterviewType] = useState<InterviewType | null>(null);
    const [difficulty, setDifficulty] = useState<InterviewDifficulty>("medium");
    const [companyContext, setCompanyContext] = useState<string>("general");
    const [durationMinutes, setDurationMinutes] = useState(30);
    const [isStarting, setIsStarting] = useState(false);

    const targetCompanies = profile?.target_companies ?? [];

    const canStart = interviewType !== null;

    async function handleStart() {
        if (!interviewType) return;
        setIsStarting(true);

        try {
            resetStore();

            const supabase = createClient();
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
                console.error("Auth error:", authError);
                toast.error("You must be signed in to start an interview.");
                setIsStarting(false);
                return;
            }

            const company = companyContext === "general" ? null : companyContext;


            // Create interview session in Supabase
            const { data: session, error } = await supabase
                .from("interview_sessions")
                .insert({
                    user_id: user.id,
                    interview_type: interviewType,
                    difficulty,
                    company_context: company,
                    status: "in_progress",
                })
                .select("id")
                .single();

            if (error) {
                console.error("Session creation error:", error);
                toast.error("Failed to create session. Please try again.");
                setIsStarting(false);
                return;
            }

            const config = {
                interviewType,
                difficulty,
                companyContext: company,
                durationMinutes,
            };

            setSession(session.id, config);
            router.push(`/interview/session?id=${session.id}`);
        } catch (err) {
            console.error("Failed to start interview:", err);
            toast.error("Something went wrong. Please try again.");
            setIsStarting(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <motion.h1
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl font-bold text-text-primary mb-8"
            >
                Configure Your Interview
            </motion.h1>

            {/* Section A - Interview Type */}
            <section className="mb-8">
                <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                    Interview Type
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {INTERVIEW_TYPES.map((type, i) => {
                        const Icon = type.icon;
                        const isSelected = interviewType === type.value;
                        return (
                            <motion.button
                                key={type.value}
                                custom={i}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                onClick={() => setInterviewType(type.value)}
                                className={`relative rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer ${isSelected
                                    ? `${type.borderColor} shadow-lg`
                                    : "border-border/50 hover:border-border"
                                    }`}
                                style={{
                                    background: isSelected
                                        ? type.color
                                        : "rgba(26,26,46,0.6)",
                                }}
                            >
                                {isSelected && (
                                    <motion.div
                                        layoutId="type-glow"
                                        className="absolute inset-0 rounded-xl"
                                        style={{
                                            background: `radial-gradient(ellipse at center, ${type.color}, transparent 70%)`,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                                <div className="relative z-10">
                                    <Icon
                                        className={`w-6 h-6 mb-2 ${isSelected ? type.textColor : "text-text-secondary/60"}`}
                                    />
                                    <span
                                        className={`text-sm font-medium ${isSelected ? "text-text-primary" : "text-text-secondary"}`}
                                    >
                                        {type.label}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </section>

            {/* Section B - Difficulty */}
            <section className="mb-8">
                <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                    Difficulty
                </h2>
                <div className="flex gap-2">
                    {DIFFICULTIES.map((d) => (
                        <button
                            key={d.value}
                            onClick={() => setDifficulty(d.value)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${difficulty === d.value
                                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                                : "bg-surface border border-border/50 text-text-secondary hover:text-text-primary hover:border-border"
                                }`}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Section C - Company Context */}
            <section className="mb-8">
                <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                    Company Context{" "}
                    <span className="text-text-secondary/40 normal-case">(optional)</span>
                </h2>
                <Select value={companyContext} onValueChange={setCompanyContext}>
                    <SelectTrigger className="bg-surface border-border/50 text-text-primary h-11">
                        <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border/50">
                        <SelectItem value="general">General (No specific company)</SelectItem>
                        {targetCompanies.map((company) => (
                            <SelectItem key={company} value={company}>
                                {company}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </section>

            {/* Section D - Duration */}
            <section className="mb-10">
                <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                    Duration
                </h2>
                <div className="flex gap-2">
                    {DURATIONS.map((d) => (
                        <button
                            key={d.value}
                            onClick={() => setDurationMinutes(d.value)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${durationMinutes === d.value
                                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                                : "bg-surface border border-border/50 text-text-secondary hover:text-text-primary hover:border-border"
                                }`}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Start button */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Button
                    onClick={handleStart}
                    disabled={!canStart || isStarting}
                    className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-base gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-40"
                >
                    {isStarting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating session...
                        </>
                    ) : (
                        <>
                            Start Interview
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </Button>
            </motion.div>
        </div>
    );
}
