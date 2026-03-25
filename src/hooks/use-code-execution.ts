"use client";

import { useState, useCallback } from "react";
import { LANGUAGE_CONFIG, type CodeExecutionResult, type SupportedLanguage } from "@/types";

const EXECUTION_TIMEOUT_MS = 15_000; // 15 s — Judge0 CE is sometimes slow

function isTimeoutError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

function friendlyExecutionError(err: unknown): string {
  if (isTimeoutError(err)) {
    return "Code execution timed out. Try simplifying your code or reducing input size.";
  }
  if (err instanceof Error) {
    if (
      err.message.toLowerCase().includes("failed to fetch") ||
      err.message.toLowerCase().includes("network")
    ) {
      return "Code execution service is unreachable. Please try again in a moment.";
    }
    return err.message;
  }
  return "Execution failed. Please try again.";
}

export function useCodeExecution() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<CodeExecutionResult | null>(null);

  const execute = async (
    code: string,
    language: SupportedLanguage,
    schema?: string,
    stdin?: string
  ) => {
    if (!code.trim()) return;
    setIsRunning(true);
    setResult(null);

    try {
      if (language === "sql") {
        // SQL runs entirely in the browser via sql.js (no network call)
        const { executeSql } = await import("@/lib/sql-executor");
        const sqlResult = await executeSql(code, schema);
        // Surface SQLite errors clearly in stderr so OutputPanel shows them
        setResult(sqlResult);
      } else {
        const config = LANGUAGE_CONFIG[language];
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT_MS);

        let res: Response;
        try {
          res = await fetch("/api/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code,
              language: config.judge0Id,
              stdin: stdin ?? "",
            }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (res.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }
        if (res.status === 429) {
          throw new Error("Execution limit reached. Upgrade for more access.");
        }
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(err.error ?? `Execution service error ${res.status}`);
        }

        const data = (await res.json()) as CodeExecutionResult;
        setResult(data);
      }
    } catch (err) {
      setResult({
        stdout: null,
        stderr: friendlyExecutionError(err),
        compile_output: null,
        status: "Error",
        executionTime: null,
        memoryUsed: null,
        language,
        version: "unknown",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const reset = useCallback(() => setResult(null), []);

  return { execute, isRunning, result, reset };
}
