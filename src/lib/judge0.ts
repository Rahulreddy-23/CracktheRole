/**
 * Code execution via Judge0 CE (https://ce.judge0.com)
 *
 * For production, set JUDGE0_API_URL and JUDGE0_API_KEY in .env.local
 * pointing to a self-hosted or RapidAPI-hosted Judge0 instance.
 */

import type { CodeExecutionResult } from "@/types";

const JUDGE0_URL =
  process.env.JUDGE0_API_URL ?? "https://ce.judge0.com";
const JUDGE0_TOKEN = process.env.JUDGE0_API_KEY; // optional
const TIMEOUT_MS = 15_000;

// Maps our judge0Id strings → Judge0 CE language IDs
// https://ce.judge0.com/languages/
const JUDGE0_LANG_IDS: Record<string, number> = {
  python:     71, // Python 3.8.1
  javascript: 63, // Node.js 12.14.0
  typescript: 74, // TypeScript 3.7.4
  java:       62, // Java OpenJDK 13
  c:          50, // C GCC 9.2.0
  "c++":      54, // C++ GCC 9.2.0
  csharp:     51, // C# Mono 6.6.0
  go:         60, // Go 1.13.5
  rust:       73, // Rust 1.40.0
};

// Judge0 status IDs
const SUCCESS_STATUS_IDS = new Set([3]); // 3 = Accepted

interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

export async function executeWithJudge0(
  language: string,    // judge0Id, e.g. "python", "c++"
  code: string,
  stdin?: string
): Promise<CodeExecutionResult> {
  const langId = JUDGE0_LANG_IDS[language.toLowerCase()];
  if (!langId) {
    return errorResult(language, `Language "${language}" is not supported.`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (JUDGE0_TOKEN) {
    headers["Authorization"] = `Bearer ${JUDGE0_TOKEN}`;
  }

  try {
    const res = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          source_code: code,
          language_id: langId,
          stdin: stdin ?? "",
        }),
      }
    );

    if (res.status === 429) {
      return errorResult(language, "Too many requests. Please wait a moment and try again.");
    }

    if (!res.ok) {
      return errorResult(language, `Execution service returned ${res.status}. Please try again.`);
    }

    const data = (await res.json()) as Judge0Response;
    const isSuccess = SUCCESS_STATUS_IDS.has(data.status.id);

    return {
      stdout: data.stdout || null,
      stderr: data.stderr || data.message || null,
      compile_output: data.compile_output?.trim() || null,
      status: isSuccess ? "Success" : data.status.description,
      executionTime: data.time ? `${data.time}s` : null,
      memoryUsed: data.memory ?? null,
      language,
      version: "ce",
    };
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    return errorResult(
      language,
      isTimeout
        ? "Code execution timed out after 15 seconds."
        : "Code execution service is temporarily unavailable. Please try again."
    );
  } finally {
    clearTimeout(timer);
  }
}

function errorResult(language: string, message: string): CodeExecutionResult {
  return {
    stdout: null,
    stderr: message,
    compile_output: null,
    status: "Error",
    executionTime: null,
    memoryUsed: null,
    language,
    version: "ce",
  };
}
