import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Judge0 CE language IDs — https://ce.judge0.com/languages
const LANGUAGE_MAP: Record<string, number> = {
  python: 100,      // Python 3.12.5
  javascript: 97,   // Node.js 20.17.0
  typescript: 101,  // TypeScript 5.0.3
  java: 91,         // Java JDK 17.0.6
  cpp: 105,         // C++ GCC 14.1.0
  go: 107,          // Go 1.23.5
  rust: 108,        // Rust (if available) or fallback
};

const JUDGE0_BASE = "https://ce.judge0.com";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { language, code, stdin } = body as {
      language: string;
      code: string;
      stdin?: string;
    };

    if (!language || !code) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: language and code" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (language === "sql") {
      return new Response(
        JSON.stringify({
          error:
            "SQL execution is not supported in the sandbox. Use the AI interviewer to validate your queries.",
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    const languageId = LANGUAGE_MAP[language];
    if (!languageId) {
      return new Response(
        JSON.stringify({ error: `Unsupported language: ${language}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Submit to Judge0 CE with wait=true (synchronous, returns result immediately)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20_000);

    const startTime = Date.now();

    let judge0Res: Response;
    try {
      judge0Res = await fetch(
        `${JUDGE0_BASE}/submissions?base64_encoded=true&wait=true&fields=stdout,stderr,status,time,compile_output`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language_id: languageId,
            source_code: Buffer.from(code).toString("base64"),
            stdin: stdin ? Buffer.from(stdin).toString("base64") : undefined,
            cpu_time_limit: 10,
            wall_time_limit: 15,
          }),
          signal: controller.signal,
        }
      );
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        return new Response(
          JSON.stringify({ error: "Code execution timed out after 20 seconds." }),
          { status: 408, headers: { "Content-Type": "application/json" } }
        );
      }
      console.error("Judge0 API error:", err);
      return new Response(
        JSON.stringify({
          error: "Code execution service unavailable. Please try again in a moment.",
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!judge0Res.ok) {
      const errText = await judge0Res.text().catch(() => "");
      console.error("Judge0 error response:", judge0Res.status, errText);
      return new Response(
        JSON.stringify({
          error: "Code execution service unavailable. Please try again in a moment.",
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await judge0Res.json();
    const executionTime = data.time ? parseFloat(data.time) : (Date.now() - startTime) / 1000;

    // Decode base64 outputs
    const decode = (b64: string | null | undefined): string => {
      if (!b64) return "";
      try {
        return Buffer.from(b64, "base64").toString("utf-8");
      } catch {
        return b64;
      }
    };

    const stdout = decode(data.stdout);
    const stderr = decode(data.stderr);
    const compileOutput = decode(data.compile_output);

    // Combine stderr and compile output
    const combinedStderr = [compileOutput, stderr]
      .filter(Boolean)
      .join("\n");

    // Judge0 status: id=3 is "Accepted" (success), others may be errors
    const statusId = data.status?.id ?? 0;
    const exitCode = statusId === 3 ? 0 : 1;

    return new Response(
      JSON.stringify({
        stdout,
        stderr: combinedStderr,
        exitCode,
        executionTime,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Execute route error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
