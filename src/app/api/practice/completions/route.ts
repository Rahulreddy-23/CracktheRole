import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("question_completions")
            .select("question_id")
            .eq("user_id", user.id);

        if (error) {
            // Table may not exist yet — return empty
            return NextResponse.json({ completedIds: [] });
        }

        const completedIds = (data ?? []).map(
            (r: { question_id: string }) => r.question_id
        );

        return NextResponse.json({ completedIds });
    } catch {
        return NextResponse.json({ completedIds: [] });
    }
}
