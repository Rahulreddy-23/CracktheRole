"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InterviewType, InterviewDifficulty } from "@/types/interview";

export async function createInterviewSessionAction(
    interviewType: InterviewType,
    difficulty: InterviewDifficulty,
    companyContext: string | null
) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { error: "You must be signed in to start an interview." };
        }

        // Self-Healing Step: Ensure profile exists before satisfying the foreign key constraint
        // This rescues users whose accounts were partially deleted by the old client-side Delete feature
        const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single();

        if (!profile) {
            console.warn(`Profile missing for user ${user.id}. Self-healing profile...`);
            const adminClient = createAdminClient();
            await adminClient.from("profiles").upsert({
                id: user.id,
                full_name: user.user_metadata?.full_name || "User",
                avatar_url: user.user_metadata?.avatar_url || null,
            });
        }

        const { data: session, error } = await supabase
            .from("interview_sessions")
            .insert({
                user_id: user.id,
                interview_type: interviewType,
                difficulty: difficulty,
                company_context: companyContext,
                status: "in_progress",
            })
            .select("id")
            .single();

        if (error) {
            console.error("Server action session creation error:", error);
            return { error: "Failed to create session in database." };
        }

        return { sessionId: session.id };
    } catch (err) {
        console.error("Failed server action:", err);
        return { error: "An unexpected error occurred." };
    }
}
