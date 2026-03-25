"use client";

import { Badge } from "@/components/ui/badge";
import type { CodeExecutionResult } from "@/types";
import { cn } from "@/lib/utils";

interface OutputPanelProps {
  result: CodeExecutionResult | null;
  isRunning: boolean;
}

export default function OutputPanel({ result, isRunning }: OutputPanelProps) {
  if (isRunning) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-blue-400 animate-spin" />
        <p className="text-sm">Executing…</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground/50 text-sm">
        Run your code to see output here
      </div>
    );
  }

  const isSuccess = result.status === "Success" || result.status === "Accepted";
  const isError =
    result.status === "Error" ||
    result.status === "Runtime Error" ||
    result.status === "Wrong Answer";

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3 font-mono text-sm">
      {/* Status + meta */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            isSuccess
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : isError
              ? "bg-red-500/15 text-red-400 border-red-500/30"
              : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
          )}
        >
          {result.status}
        </Badge>

        {result.executionTime && (
          <span className="text-xs text-muted-foreground">
            {result.executionTime}
          </span>
        )}
        {result.memoryUsed && (
          <span className="text-xs text-muted-foreground">
            {(result.memoryUsed / 1024).toFixed(1)} KB
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {result.language}
          {result.version && result.version !== "unknown" && (
            <span className="text-muted-foreground/50"> · {result.version}</span>
          )}
        </span>
      </div>

      {/* stdout */}
      {result.stdout && (
        <div className="rounded-lg bg-black/50 border border-white/10 overflow-hidden">
          <div className="px-3 py-1.5 border-b border-white/10 flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Output
            </span>
          </div>
          <pre className="p-3 text-emerald-400 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
            {result.stdout}
          </pre>
        </div>
      )}

      {/* compile_output */}
      {result.compile_output && (
        <div className="rounded-lg bg-black/50 border border-yellow-500/20 overflow-hidden">
          <div className="px-3 py-1.5 border-b border-yellow-500/20">
            <span className="text-[10px] text-yellow-400 uppercase tracking-wider">
              Compilation Output
            </span>
          </div>
          <pre className="p-3 text-yellow-300 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
            {result.compile_output}
          </pre>
        </div>
      )}

      {/* stderr */}
      {result.stderr && (
        <div className="rounded-lg bg-black/50 border border-red-500/20 overflow-hidden">
          <div className="px-3 py-1.5 border-b border-red-500/20">
            <span className="text-[10px] text-red-400 uppercase tracking-wider">
              Error
            </span>
          </div>
          <pre className="p-3 text-red-300 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
            {result.stderr}
          </pre>
        </div>
      )}
    </div>
  );
}
