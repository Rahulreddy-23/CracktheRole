import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProblemSolver from "@/components/practice/ProblemSolver";
import type { Metadata } from "next";

interface SolvePageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: SolvePageProps): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data: question } = await supabase
        .from("questions")
        .select("title")
        .eq("id", id)
        .single();

    return {
        title: question ? `${question.title} — Solve` : "Problem Solver",
        description: "Solve coding problems in a LeetCode-style environment.",
    };
}

export default async function SolvePage({ params }: SolvePageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: question, error } = await supabase
        .from("questions")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !question) {
        notFound();
    }

    // Get user's previous completion (if any)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let previousCode: string | null = null;
    let previousLanguage: string | null = null;

    if (user) {
        const { data: completion } = await supabase
            .from("question_completions")
            .select("code, language")
            .eq("user_id", user.id)
            .eq("question_id", id)
            .maybeSingle();

        if (completion) {
            previousCode = completion.code;
            previousLanguage = completion.language;
        }
    }

    return (
        <main className="h-screen bg-background overflow-hidden">
            <ProblemSolver
                question={question}
                previousCode={previousCode}
                previousLanguage={previousLanguage}
            />
        </main>
    );
}
