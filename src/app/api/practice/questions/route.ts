import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";


export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    let userId: string | null = null;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = user.id;

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const company = searchParams.get("company") || "";
    const bookmarkedOnly = searchParams.get("bookmarked") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = 20;
    const offset = (page - 1) * limit;

    // Fetch user's bookmarked question IDs
    let bookmarkedIds: string[] = [];
    if (userId) {
      const { data: bookmarkData } = await supabase
        .from("bookmarks")
        .select("question_id")
        .eq("user_id", userId);

      bookmarkedIds = (bookmarkData ?? []).map(
        (b: { question_id: string }) => b.question_id
      );
    }

    // If bookmarked-only filter is active but user has no bookmarks, return early
    if (bookmarkedOnly && bookmarkedIds.length === 0) {
      return NextResponse.json({
        questions: [],
        total: 0,
        bookmarkedIds: [],
        page,
        hasMore: false,
      });
    }

    // Build filtered query
    let query = supabase.from("questions").select("*", { count: "exact" });

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    if (category) {
      query = query.eq(
        "category",
        category as "dsa" | "system_design" | "behavioral" | "sql"
      );
    }

    if (difficulty) {
      query = query.eq(
        "difficulty",
        difficulty as "easy" | "medium" | "hard"
      );
    }

    if (company) {
      query = query.contains("company_tags", [company]);
    }

    if (bookmarkedOnly) {
      query = query.in("id", bookmarkedIds);
    }

    const {
      data: questions,
      error,
      count,
    } = await query
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching questions:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count ?? 0;

    return NextResponse.json({
      questions: questions ?? [],
      total,
      bookmarkedIds,
      page,
      hasMore: total > offset + limit,
    });
  } catch (err) {
    console.error("Practice questions API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
