import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/salary?company=&role=&min_exp=&max_exp=&city=
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const company = searchParams.get("company");
    const role = searchParams.get("role");
    const minExp = searchParams.get("min_exp");
    const maxExp = searchParams.get("max_exp");
    const city = searchParams.get("city");

    let query = supabase
      .from("salary_entries")
      .select("*")
      .order("total_ctc", { ascending: false });

    if (company) {
      query = query.ilike("company", `%${company}%`);
    }
    if (role) {
      query = query.eq("role", role);
    }
    if (city) {
      query = query.eq("city", city);
    }
    if (minExp) {
      query = query.gte("experience_years", parseInt(minExp));
    }
    if (maxExp) {
      query = query.lte("experience_years", parseInt(maxExp));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Salary fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch salary data" }, { status: 500 });
    }

    return NextResponse.json({ entries: data ?? [] });
  } catch (error) {
    console.error("Salary GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/salary — contribute a salary entry
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      company,
      role,
      experience_years,
      base_salary,
      bonus,
      esop_value,
      total_ctc,
      city,
    } = body;

    // Basic validation
    if (!company || !role || experience_years === undefined || !base_salary || !total_ctc) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const expectedTotal = base_salary + (bonus ?? 0) + (esop_value ?? 0);
    if (Math.abs(expectedTotal - total_ctc) > 1) {
      return NextResponse.json(
        { error: "Total CTC must equal Base + Bonus + ESOP" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("salary_entries").insert({
      company,
      role,
      experience_years,
      base_salary,
      bonus: bonus ?? 0,
      esop_value: esop_value ?? 0,
      total_ctc,
      city: city ?? "bangalore",
    });

    if (error) {
      console.error("Salary insert error:", error);
      return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Salary POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
