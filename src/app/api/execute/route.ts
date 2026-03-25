import { NextRequest, NextResponse } from "next/server";
import { executeWithJudge0 } from "@/lib/judge0";
import { LANGUAGE_CONFIG } from "@/types";

// Valid judge0Ids that route to Judge0 CE (SQL is excluded — runs in browser via sql.js)
const SUPPORTED_JUDGE0_IDS = new Set(
  Object.values(LANGUAGE_CONFIG)
    .map((c) => c.judge0Id)
    .filter((id) => id !== "sqlite3")
);

// ── Rate limiter (sliding window, in-memory) ────────────────────────────────
// For multi-instance deployments replace this with Upstash Redis + @upstash/ratelimit.
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;  // per identifier per window

const requestLog = new Map<string, number[]>();

function isRateLimited(id: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (requestLog.get(id) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= MAX_REQUESTS) return true;
  timestamps.push(now);
  requestLog.set(id, timestamps);
  return false;
}

export async function POST(request: NextRequest) {
  // Use userId from header if set by auth middleware, fall back to IP
  const rateLimitId =
    request.headers.get("x-user-id") ??
    request.headers.get("x-forwarded-for") ??
    "anonymous";

  if (isRateLimited(rateLimitId)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before running more code." },
      { status: 429 }
    );
  }

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
      {
        error: `Language "${language}" is not supported via this endpoint. SQL runs in the browser.`,
      },
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
