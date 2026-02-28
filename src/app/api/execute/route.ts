import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ExecuteRequestBody {
  language: string;
  code: string;
  stdin?: string;
}

interface PistonFile {
  content: string;
}

interface PistonRequest {
  language: string;
  version: string;
  files: PistonFile[];
  stdin?: string;
}

interface PistonRunResult {
  stdout: string;
  stderr: string;
  code: number | null;
  signal: string | null;
  output: string;
}

interface PistonResponse {
  language: string;
  version: string;
  run: PistonRunResult;
  compile?: PistonRunResult;
}

interface ExecuteResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
}

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: "python", version: "3.10.0" },
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
  go: { language: "go", version: "1.16.2" },
  rust: { language: "rust", version: "1.68.2" },
};

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

    const body: ExecuteRequestBody = await request.json();
    const { language, code, stdin } = body;

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

    const pistonLang = LANGUAGE_MAP[language];
    if (!pistonLang) {
      return new Response(
        JSON.stringify({ error: `Unsupported language: ${language}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const pistonPayload: PistonRequest = {
      language: pistonLang.language,
      version: pistonLang.version,
      files: [{ content: code }],
      ...(stdin ? { stdin } : {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    const startTime = Date.now();
    let pistonRes: Response;

    try {
      pistonRes = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pistonPayload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const executionTime = (Date.now() - startTime) / 1000;

    if (!pistonRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Code execution service unavailable. Please try again.",
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const pistonData: PistonResponse = await pistonRes.json();

    const stderrParts = [
      pistonData.compile?.stderr,
      pistonData.run.stderr,
    ].filter((s): s is string => Boolean(s));
    const combinedStderr = stderrParts.join("\n");

    const exitCode =
      pistonData.compile !== undefined && pistonData.compile.code !== 0
        ? (pistonData.compile.code ?? 1)
        : (pistonData.run.code ?? 0);

    const result: ExecuteResponse = {
      stdout: pistonData.run.stdout ?? "",
      stderr: combinedStderr,
      exitCode,
      executionTime,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return new Response(
        JSON.stringify({ error: "Code execution timed out after 15 seconds." }),
        { status: 408, headers: { "Content-Type": "application/json" } }
      );
    }

    console.error("Execute route error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
