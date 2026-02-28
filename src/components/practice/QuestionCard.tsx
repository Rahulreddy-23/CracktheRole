"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BookmarkButton from "./BookmarkButton";
import QuestionExpanded from "./QuestionExpanded";
import { cn } from "@/lib/utils";

export interface Question {
  id: string;
  title: string;
  description: string;
  category: "dsa" | "system_design" | "behavioral" | "sql";
  difficulty: "easy" | "medium" | "hard";
  company_tags: string[];
  topic_tags: string[];
  hints: string[];
  solution: string | null;
  starter_code: Record<string, string> | null;
  test_cases: Array<{ input: string; expected_output: string }> | null;
  question_number: number | null;
  created_at: string;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  dsa: {
    label: "DSA",
    badgeClass:
      "bg-brand-primary/15 text-brand-primary-light border-brand-primary/30",
  },
  system_design: {
    label: "System Design",
    badgeClass:
      "bg-brand-secondary/15 text-brand-secondary border-brand-secondary/30",
  },
  behavioral: {
    label: "Behavioral",
    badgeClass:
      "bg-brand-success/15 text-brand-success border-brand-success/30",
  },
  sql: {
    label: "SQL",
    badgeClass:
      "bg-brand-warning/15 text-brand-warning border-brand-warning/30",
  },
};

const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; badgeClass: string; dotClass: string }
> = {
  easy: {
    label: "Easy",
    badgeClass:
      "bg-brand-success/15 text-brand-success border-brand-success/30",
    dotClass: "bg-brand-success",
  },
  medium: {
    label: "Medium",
    badgeClass: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    dotClass: "bg-yellow-400",
  },
  hard: {
    label: "Hard",
    badgeClass: "bg-brand-danger/15 text-brand-danger border-brand-danger/30",
    dotClass: "bg-brand-danger",
  },
};

interface QuestionCardProps {
  question: Question;
  isBookmarked: boolean;
  isSolved?: boolean;
  index: number;
  onBookmarkChange: (questionId: string, isNowBookmarked: boolean) => void;
}

export default function QuestionCard({
  question,
  isBookmarked,
  isSolved = false,
  index,
  onBookmarkChange,
}: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const canSolve = question.category === "dsa" || question.category === "sql";

  const cat = CATEGORY_CONFIG[question.category];
  const diff = DIFFICULTY_CONFIG[question.difficulty];

  return (
    <motion.div
      layout="position"
      className={cn(
        "rounded-xl border border-border/40 bg-surface overflow-hidden transition-all duration-200",
        "hover:border-border/70 hover:shadow-sm",
        isSolved && "border-l-2 border-l-brand-success"
      )}
    >
      {/* Collapsed header — always visible */}
      <div className="w-full flex items-center justify-between px-4 py-3 gap-3 min-w-0">
        <div
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
          role="button"
          tabIndex={0}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${question.title}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsExpanded((prev) => !prev);
            }
          }}
        >
          {/* Question number */}
          <span className="text-xs font-mono text-text-secondary/50 w-6 text-right shrink-0">
            {question.question_number ?? index + 1}
          </span>

          {/* Expand/collapse indicator */}
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-text-secondary/40 shrink-0 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />

          {/* Question title */}
          <span className="text-sm font-medium text-text-primary flex-1 min-w-0 truncate text-left">
            {question.title}
          </span>

          {/* Solved indicator */}
          {isSolved && (
            <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
          )}

          {/* Category badge (hidden on small screens) */}
          {cat && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-medium shrink-0 hidden sm:inline-flex",
                cat.badgeClass
              )}
            >
              {cat.label}
            </Badge>
          )}

          {/* Difficulty badge */}
          {diff && (
            <Badge
              variant="outline"
              className={cn("text-[10px] font-medium shrink-0", diff.badgeClass)}
            >
              {diff.label}
            </Badge>
          )}

          {/* Company tags — first two, then overflow count */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {question.company_tags.slice(0, 2).map((company) => (
              <span
                key={company}
                className="text-[10px] px-1.5 py-0.5 rounded bg-surface2 text-text-secondary/60 border border-border/30 whitespace-nowrap"
              >
                {company}
              </span>
            ))}
            {question.company_tags.length > 2 && (
              <span className="text-[10px] text-text-secondary/40">
                +{question.company_tags.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {canSolve && (
            <Link
              href={`/practice/solve/${question.id}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-brand-success/15 text-brand-success border border-brand-success/30 hover:bg-brand-success/25 transition-colors"
              aria-label={`Solve ${question.title}`}
            >
              <Code2 className="w-3 h-3" />
              <span className="hidden sm:inline">Solve</span>
            </Link>
          )}
          <BookmarkButton
            questionId={question.id}
            isBookmarked={isBookmarked}
            onToggle={onBookmarkChange}
            size="sm"
          />
        </div>
      </div>

      {/* Expanded content with animation */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/30">
              <QuestionExpanded
                question={question}
                isBookmarked={isBookmarked}
                onBookmarkChange={onBookmarkChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
