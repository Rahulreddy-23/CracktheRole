import { createClient } from "@supabase/supabase-js";

// Initialize with env vars
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

async function testInsert() {
    console.log("Starting test...");

    // Try to query the table just to see if it responds
    try {
        const { data, error } = await supabase
            .from("interview_sessions")
            .insert({
                user_id: "00000000-0000-0000-0000-000000000000",
                interview_type: "dsa",
                difficulty: "easy",
                status: "in_progress",
            })
            .select("id");

        console.log("Insert result:", { data, error });
    } catch (err) {
        console.error("Insert threw error:", err);
    }
}

testInsert();
