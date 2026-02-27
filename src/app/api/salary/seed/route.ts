import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type SalaryInsert = Database["public"]["Tables"]["salary_entries"]["Insert"];

const SEED_ENTRIES: SalaryInsert[] = [
  // Google
  { company: "Google", role: "Data Engineer", experience_years: 2, base_salary: 28, bonus: 6, esop_value: 8, total_ctc: 42, city: "bangalore" },
  { company: "Google", role: "Data Engineer", experience_years: 4, base_salary: 38, bonus: 9, esop_value: 14, total_ctc: 61, city: "bangalore" },
  { company: "Google", role: "Data Engineer", experience_years: 7, base_salary: 52, bonus: 14, esop_value: 24, total_ctc: 90, city: "hyderabad" },
  { company: "Google", role: "Backend SWE", experience_years: 3, base_salary: 35, bonus: 8, esop_value: 12, total_ctc: 55, city: "bangalore" },
  { company: "Google", role: "ML Engineer", experience_years: 5, base_salary: 48, bonus: 12, esop_value: 20, total_ctc: 80, city: "bangalore" },

  // Amazon
  { company: "Amazon", role: "Data Engineer", experience_years: 2, base_salary: 22, bonus: 18, esop_value: 5, total_ctc: 45, city: "bangalore" },
  { company: "Amazon", role: "Data Engineer", experience_years: 5, base_salary: 32, bonus: 24, esop_value: 9, total_ctc: 65, city: "hyderabad" },
  { company: "Amazon", role: "Backend SWE", experience_years: 3, base_salary: 26, bonus: 20, esop_value: 6, total_ctc: 52, city: "bangalore" },
  { company: "Amazon", role: "ML Engineer", experience_years: 6, base_salary: 40, bonus: 28, esop_value: 12, total_ctc: 80, city: "bangalore" },
  { company: "Amazon", role: "Backend SWE", experience_years: 8, base_salary: 52, bonus: 35, esop_value: 18, total_ctc: 105, city: "hyderabad" },

  // Microsoft
  { company: "Microsoft", role: "Data Engineer", experience_years: 3, base_salary: 26, bonus: 5, esop_value: 7, total_ctc: 38, city: "hyderabad" },
  { company: "Microsoft", role: "Backend SWE", experience_years: 4, base_salary: 30, bonus: 6, esop_value: 9, total_ctc: 45, city: "hyderabad" },
  { company: "Microsoft", role: "ML Engineer", experience_years: 5, base_salary: 36, bonus: 8, esop_value: 14, total_ctc: 58, city: "bangalore" },
  { company: "Microsoft", role: "Data Engineer", experience_years: 8, base_salary: 50, bonus: 12, esop_value: 20, total_ctc: 82, city: "hyderabad" },

  // Flipkart
  { company: "Flipkart", role: "Data Engineer", experience_years: 2, base_salary: 18, bonus: 4, esop_value: 3, total_ctc: 25, city: "bangalore" },
  { company: "Flipkart", role: "Backend SWE", experience_years: 3, base_salary: 22, bonus: 5, esop_value: 5, total_ctc: 32, city: "bangalore" },
  { company: "Flipkart", role: "Backend SWE", experience_years: 6, base_salary: 35, bonus: 8, esop_value: 10, total_ctc: 53, city: "bangalore" },
  { company: "Flipkart", role: "ML Engineer", experience_years: 4, base_salary: 28, bonus: 6, esop_value: 8, total_ctc: 42, city: "bangalore" },

  // Razorpay
  { company: "Razorpay", role: "Backend SWE", experience_years: 2, base_salary: 20, bonus: 3, esop_value: 7, total_ctc: 30, city: "bangalore" },
  { company: "Razorpay", role: "Backend SWE", experience_years: 4, base_salary: 30, bonus: 5, esop_value: 12, total_ctc: 47, city: "bangalore" },
  { company: "Razorpay", role: "Data Engineer", experience_years: 3, base_salary: 22, bonus: 4, esop_value: 8, total_ctc: 34, city: "bangalore" },

  // PhonePe
  { company: "PhonePe", role: "Backend SWE", experience_years: 3, base_salary: 24, bonus: 4, esop_value: 9, total_ctc: 37, city: "bangalore" },
  { company: "PhonePe", role: "Data Engineer", experience_years: 2, base_salary: 18, bonus: 3, esop_value: 6, total_ctc: 27, city: "bangalore" },
  { company: "PhonePe", role: "ML Engineer", experience_years: 5, base_salary: 34, bonus: 6, esop_value: 14, total_ctc: 54, city: "bangalore" },

  // Uber
  { company: "Uber", role: "Backend SWE", experience_years: 4, base_salary: 32, bonus: 7, esop_value: 11, total_ctc: 50, city: "bangalore" },
  { company: "Uber", role: "Data Engineer", experience_years: 3, base_salary: 26, bonus: 5, esop_value: 9, total_ctc: 40, city: "bangalore" },
  { company: "Uber", role: "ML Engineer", experience_years: 6, base_salary: 42, bonus: 9, esop_value: 16, total_ctc: 67, city: "bangalore" },

  // Swiggy
  { company: "Swiggy", role: "Backend SWE", experience_years: 2, base_salary: 17, bonus: 3, esop_value: 5, total_ctc: 25, city: "bangalore" },
  { company: "Swiggy", role: "Data Engineer", experience_years: 4, base_salary: 25, bonus: 4, esop_value: 8, total_ctc: 37, city: "bangalore" },
  { company: "Swiggy", role: "ML Engineer", experience_years: 5, base_salary: 32, bonus: 6, esop_value: 12, total_ctc: 50, city: "bangalore" },

  // Zerodha
  { company: "Zerodha", role: "Backend SWE", experience_years: 3, base_salary: 20, bonus: 5, esop_value: 0, total_ctc: 25, city: "bangalore" },
  { company: "Zerodha", role: "Data Engineer", experience_years: 2, base_salary: 16, bonus: 4, esop_value: 0, total_ctc: 20, city: "bangalore" },
  { company: "Zerodha", role: "Backend SWE", experience_years: 6, base_salary: 30, bonus: 8, esop_value: 0, total_ctc: 38, city: "bangalore" },

  // CRED
  { company: "CRED", role: "Backend SWE", experience_years: 2, base_salary: 20, bonus: 3, esop_value: 7, total_ctc: 30, city: "bangalore" },
  { company: "CRED", role: "Data Engineer", experience_years: 4, base_salary: 28, bonus: 5, esop_value: 10, total_ctc: 43, city: "bangalore" },
  { company: "CRED", role: "ML Engineer", experience_years: 3, base_salary: 25, bonus: 4, esop_value: 9, total_ctc: 38, city: "bangalore" },

  // Remote entries
  { company: "Google", role: "Backend SWE", experience_years: 5, base_salary: 45, bonus: 10, esop_value: 18, total_ctc: 73, city: "remote" },
  { company: "Amazon", role: "ML Engineer", experience_years: 4, base_salary: 36, bonus: 26, esop_value: 10, total_ctc: 72, city: "remote" },
  { company: "Microsoft", role: "Backend SWE", experience_years: 6, base_salary: 40, bonus: 9, esop_value: 15, total_ctc: 64, city: "remote" },

  // Pune / Chennai / Delhi NCR
  { company: "Amazon", role: "Data Engineer", experience_years: 3, base_salary: 20, bonus: 15, esop_value: 5, total_ctc: 40, city: "pune" },
  { company: "Microsoft", role: "Backend SWE", experience_years: 7, base_salary: 44, bonus: 10, esop_value: 16, total_ctc: 70, city: "delhi_ncr" },
];

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 });
    }

    const supabase = createServiceClient<Database>(supabaseUrl, serviceKey);

    // Clear existing seed data and re-insert
    await supabase.from("salary_entries").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const { error } = await supabase.from("salary_entries").insert(SEED_ENTRIES);

    if (error) {
      console.error("Salary seed error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: SEED_ENTRIES.length });
  } catch (err) {
    console.error("Salary seed failed:", err);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
