"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, ChevronRight, Eye, EyeOff, Play, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookmarkButton from "./BookmarkButton";
import { cn } from "@/lib/utils";
import type { Question } from "./QuestionCard";

const CATEGORY_TO_INTERVIEW_TYPE: Record<string, string> = {
  dsa: "coding",
  system_design: "system-design",
  behavioral: "behavioral",
  sql: "technical",
};

// Shared markdown component config used for both description and solution
function MarkdownBody({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const isBlock = Boolean(className?.includes("language-"));
          if (isBlock) {
            return (
              <code
                {...props}
                className="block bg-surface2 border border-border/30 rounded-md px-3 py-2.5 text-xs font-mono text-text-primary overflow-x-auto whitespace-pre"
              >
                {children}
              </code>
            );
          }
          return (
            <code
              {...props}
              className="bg-surface2 border border-border/30 rounded px-1.5 py-0.5 text-xs font-mono text-brand-primary-light"
            >
              {children}
            </code>
          );
        },
        pre({ children }) {
          return (
            <pre className="bg-transparent p-0 m-0 overflow-x-auto">
              {children}
            </pre>
          );
        },
        p({ children }) {
          return (
            <p className="text-text-secondary text-sm leading-relaxed mb-2 last:mb-0">
              {children}
            </p>
          );
        },
        strong({ children }) {
          return (
            <strong className="text-text-primary font-semibold">
              {children}
            </strong>
          );
        },
        ul({ children }) {
          return (
            <ul className="list-disc list-outside pl-4 space-y-1 mb-2">
              {children}
            </ul>
          );
        },
        ol({ children }) {
          return (
            <ol className="list-decimal list-outside pl-4 space-y-1 mb-2">
              {children}
            </ol>
          );
        },
        li({ children }) {
          return <li className="text-text-secondary text-sm">{children}</li>;
        },
        h2({ children }) {
          return (
            <h2 className="text-sm font-semibold text-text-primary mt-3 mb-1">
              {children}
            </h2>
          );
        },
        h3({ children }) {
          return (
            <h3 className="text-sm font-medium text-text-primary mt-2 mb-1">
              {children}
            </h3>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

interface QuestionExpandedProps {
  question: Question;
  isBookmarked: boolean;
  onBookmarkChange: (questionId: string, isNowBookmarked: boolean) => void;
}

export default function QuestionExpanded({
  question,
  isBookmarked,
  onBookmarkChange,
}: QuestionExpandedProps) {
  const router = useRouter();
  const [hintsOpen, setHintsOpen] = useState(false);
  const [shownHints, setShownHints] = useState(0);
  const [solutionConfirming, setSolutionConfirming] = useState(false);
  const [solutionVisible, setSolutionVisible] = useState(false);

  const handleShowNextHint = () => {
    if (shownHints < question.hints.length) {
      setShownHints((prev) => prev + 1);
    }
  };

  const handlePractice = () => {
    const type =
      CATEGORY_TO_INTERVIEW_TYPE[question.category] ?? "coding";
    const params = new URLSearchParams({ type, difficulty: question.difficulty });
    router.push(`/interview/setup?${params.toString()}`);
  };

  return (
    <div className="px-4 pb-4 pt-3 space-y-4">
      {/* Description */}
      <div>
        <MarkdownBody content={question.description} />
      </div>

      {/* Hints */}
      {question.hints.length > 0 && (
        <div className="border border-border/30 rounded-lg overflow-hidden">
          <button
            onClick={() => setHintsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface2/40 transition-colors"
          >
            <span>
              Hints ({question.hints.length})
            </span>
            {hintsOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {hintsOpen && (
            <div className="border-t border-border/30 bg-surface2/20 px-4 py-3 space-y-2.5">
              {question.hints.slice(0, shownHints).map((hint, i) => (
                <div key={i} className="flex gap-2.5 text-sm">
                  <span className="text-brand-primary-light font-mono text-xs mt-0.5 shrink-0 w-4">
                    {i + 1}.
                  </span>
                  <span className="text-text-secondary leading-relaxed">
                    {hint}
                  </span>
                </div>
              ))}

              {shownHints < question.hints.length ? (
                <button
                  onClick={handleShowNextHint}
                  className="text-xs text-brand-primary-light hover:text-brand-primary transition-colors"
                >
                  {shownHints === 0 ? "Show first hint" : "Show next hint"}
                </button>
              ) : (
                <p className="text-xs text-text-secondary/40">
                  All hints shown.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Solution */}
      {question.solution && (
        <div className="border border-border/30 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs font-medium text-text-secondary">
              Solution
            </span>
            <div className="flex items-center gap-2">
              {!solutionVisible && !solutionConfirming && (
                <button
                  onClick={() => setSolutionConfirming(true)}
                  className="flex items-center gap-1.5 text-xs text-brand-primary-light hover:text-brand-primary transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Reveal Solution
                </button>
              )}
              {solutionVisible && (
                <button
                  onClick={() => {
                    setSolutionVisible(false);
                    setSolutionConfirming(false);
                  }}
                  className="flex items-center gap-1.5 text-xs text-text-secondary/50 hover:text-text-secondary transition-colors"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Hide
                </button>
              )}
            </div>
          </div>

          {/* Confirmation banner */}
          {solutionConfirming && !solutionVisible && (
            <div className="border-t border-brand-warning/20 bg-brand-warning/5 px-4 py-3 flex items-center justify-between gap-4">
              <p className="text-xs text-brand-warning/80 leading-relaxed">
                Revealing the solution before attempting the problem may reduce
                your learning. Try working through it first.
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setSolutionConfirming(false)}
                  className="text-xs text-text-secondary/60 hover:text-text-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSolutionVisible(true);
                    setSolutionConfirming(false);
                  }}
                  className="text-xs text-brand-warning hover:text-brand-warning/80 font-medium transition-colors"
                >
                  Reveal anyway
                </button>
              </div>
            </div>
          )}

          {/* Solution content */}
          {solutionVisible && (
            <div
              className={cn(
                "border-t border-border/30 px-4 py-3",
                solutionConfirming && "border-t-0"
              )}
            >
              <MarkdownBody content={question.solution} />
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between pt-1 gap-3">
        <div className="flex items-center gap-2">
          {(question.category === "dsa" || question.category === "sql") && (
            <Button
              onClick={() => router.push(`/practice/solve/${question.id}`)}
              size="sm"
              className="bg-brand-success hover:bg-brand-success/90 text-white text-xs h-8 px-4 gap-1.5 shadow-sm shadow-brand-success/20"
            >
              <Code2 className="w-3.5 h-3.5" />
              Solve this question
            </Button>
          )}
          <Button
            onClick={handlePractice}
            size="sm"
            variant={(question.category === "dsa" || question.category === "sql") ? "outline" : "default"}
            className={cn(
              "text-xs h-8 px-4 gap-1.5",
              (question.category === "dsa" || question.category === "sql")
                ? "border-brand-primary/30 text-brand-primary-light hover:text-brand-primary hover:bg-brand-primary/10"
                : "bg-brand-primary hover:bg-brand-primary/90 text-white shadow-sm shadow-brand-primary/20"
            )}
          >
            <Play className="w-3.5 h-3.5" />
            Practice in Interview
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <BookmarkButton
            questionId={question.id}
            isBookmarked={isBookmarked}
            onToggle={onBookmarkChange}
          />
          <span className="text-xs text-text-secondary/50 select-none">
            {isBookmarked ? "Bookmarked" : "Bookmark"}
          </span>
        </div>
      </div>
    </div>
  );
}
