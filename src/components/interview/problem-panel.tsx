"use client";

import dynamic from "next/dynamic";
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { InterviewProblem } from "@/types";
import { cn } from "@/lib/utils";

interface ProblemPanelProps {
  problem: InterviewProblem;
  type: "coding" | "system-design" | "behavioral";
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function ProblemPanel({ problem }: ProblemPanelProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-5 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start gap-3 flex-wrap">
            <h1 className="text-xl font-bold leading-tight flex-1">
              {problem.title}
            </h1>
            <Badge
              variant="outline"
              className={cn(
                "capitalize text-xs shrink-0",
                DIFFICULTY_STYLES[problem.difficulty]
              )}
            >
              {problem.difficulty}
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">
            {problem.topic}
          </Badge>
        </div>

        {/* Description */}
        <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-foreground/90">
          <ReactMarkdown>{problem.description}</ReactMarkdown>
        </div>

        {/* Examples */}
        {problem.examples.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Examples
            </h2>
            <div className="space-y-3">
              {problem.examples.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-2"
                >
                  <p className="text-xs font-semibold text-muted-foreground">
                    Example {i + 1}
                  </p>
                  <div className="font-mono text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">Input: </span>
                      <span className="text-foreground">{ex.input}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Output: </span>
                      <span className="text-foreground">{ex.output}</span>
                    </p>
                    {ex.explanation && (
                      <p className="text-muted-foreground text-xs pt-1">
                        <span className="font-semibold">Explanation: </span>
                        {ex.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Constraints */}
        {problem.constraints.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Constraints
            </h2>
            <ul className="space-y-1.5">
              {problem.constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                  <span className="font-mono text-xs text-foreground/80">{c}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Hints */}
        {problem.hints.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Hints
            </h2>
            <Accordion type="multiple" className="space-y-1">
              {problem.hints.map((hint, i) => (
                <AccordionItem
                  key={i}
                  value={`hint-${i}`}
                  className="border border-white/10 rounded-lg px-3 not-last:border-b not-last:border-white/10"
                >
                  <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground hover:no-underline py-2.5">
                    Show Hint {i + 1}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground/80 pb-3">
                    {hint}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}
      </div>
    </div>
  );
}
