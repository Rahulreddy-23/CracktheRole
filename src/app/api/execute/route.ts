import { NextResponse } from "next/server";
import { executeWithJudge0 } from "@/lib/judge0";
import { LANGUAGE_CONFIG } from "@/types";

// Valid judge0Ids that route to Judge0 CE (SQL is excluded — runs in browser via sql.js)
const SUPPORTED_JUDGE0_IDS = new Set(
  Object.values(LANGUAGE_CONFIG)
    .map((c) => c.judge0Id)
    .filter((id) => id !== "sqlite3")
);

export async function POST(request: Request) {
  let body: { code?: string; language?: string; stdin?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { code, language, stdin } = body;

  if (!code || !language) {
    return NextResponse.json(
      { error: "Missing required fields: code, language" },
      { status: 400 }
    );
  }

  // Reject SQL — it's handled client-side via sql.js
  if (language === "sqlite3" || !SUPPORTED_JUDGE0_IDS.has(language)) {
    return NextResponse.json(
      { error: `Language "${language}" is not supported via this endpoint. SQL runs in the browser.` },
      { status: 400 }
    );
  }

  try {
    const result = await executeWithJudge0(language, code, stdin);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/execute] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Execution failed" },
      { status: 500 }
    );
  }
}
