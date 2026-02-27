import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, action } = body as {
      questionId: string;
      action: "add" | "remove";
    };

    if (!questionId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: questionId, action" },
        { status: 400 }
      );
    }

    if (action === "add") {
      const { error } = await supabase.from("bookmarks").upsert(
        { user_id: user.id, question_id: questionId },
        { onConflict: "user_id,question_id" }
      );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (action === "remove") {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("question_id", questionId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'add' or 'remove'" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Bookmark API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
