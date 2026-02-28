"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Send,
  RotateCcw,
  Timer,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Lightbulb,
  BookOpen,
  Code2,
  Plus,
  X,
  Trophy,
  AlertCircle,
  ChevronRight,
  Clock,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Monaco Editor (SSR-disabled)
// ---------------------------------------------------------------------------
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-5 h-5 text-[#6C3CE1] animate-spin" />
        <span className="text-xs text-[#94A3B8]">Loading editor...</span>
      </div>
    </div>
  ),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Param {
  name: string;
  type: string;
}

interface DBTestCase {
  label: string;
  inputs: Record<string, unknown>;
  expected: unknown;
  isPublic: boolean;
}

interface QuestionData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  company_tags: string[];
  topic_tags: string[];
  hints: string[];
  solution: string | null;
  starter_code: Record<string, string> | null;
  test_cases: DBTestCase[] | null;
  question_number: number | null;
  function_name: string | null;
  params: Param[] | null;
  return_type: string | null;
}

interface ProblemSolverProps {
  question: QuestionData;
  previousCode: string | null;
  previousLanguage: string | null;
}

interface RunResult {
  label: string;
  inputs: Record<string, unknown>;
  expected: unknown;
  actual: string;
  passed: boolean;
  error?: string;
  executionTime?: number;
}

interface SubmitResult {
  status: "accepted" | "wrong_answer" | "runtime_error" | "compile_error";
  passed: number;
  total: number;
  results: RunResult[];
  avgTimeMs: number;
}

// Editable inputs per test case: {paramName -> raw string value}
type CaseInputState = Record<string, string>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const LANGUAGES = [
  { value: "python",     label: "Python 3",    monacoLang: "python" },
  { value: "javascript", label: "JavaScript",  monacoLang: "javascript" },
  { value: "java",       label: "Java",        monacoLang: "java" },
  { value: "cpp",        label: "C++",         monacoLang: "cpp" },
];

const DIFFICULTY_CONFIG = {
  easy:   { label: "Easy",   cls: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30" },
  medium: { label: "Medium", cls: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30" },
  hard:   { label: "Hard",   cls: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30" },
};

// ---------------------------------------------------------------------------
// Normalize output for comparison
// "[0, 1]" === "[0,1]", "True" === "true"
// ---------------------------------------------------------------------------
function normalizeExpected(val: unknown): string {
  if (typeof val === "boolean") return val.toString();
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) return JSON.stringify(val);
  if (typeof val === "string") return val;
  return JSON.stringify(val);
}

// ---------------------------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------------------------
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
                className="block bg-[#0F0F23] border border-[#1E293B] rounded-md px-3 py-2.5 text-xs font-mono text-[#E2E8F0] overflow-x-auto whitespace-pre my-2"
              >
                {children}
              </code>
            );
          }
          return (
            <code
              {...props}
              className="bg-[#16213E] border border-[#1E293B] rounded px-1.5 py-0.5 text-xs font-mono text-[#8B5CF6]"
            >
              {children}
            </code>
          );
        },
        pre({ children }) {
          return <pre className="bg-transparent p-0 m-0 overflow-x-auto">{children}</pre>;
        },
        p({ children }) {
          return (
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-3 last:mb-0">
              {children}
            </p>
          );
        },
        strong({ children }) {
          return <strong className="text-[#E2E8F0] font-semibold">{children}</strong>;
        },
        ul({ children }) {
          return <ul className="list-disc list-outside pl-5 space-y-1 mb-3">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-outside pl-5 space-y-1 mb-3">{children}</ol>;
        },
        li({ children }) {
          return <li className="text-[#94A3B8] text-sm leading-relaxed">{children}</li>;
        },
        h2({ children }) {
          return (
            <h2 className="text-sm font-semibold text-[#E2E8F0] mt-4 mb-2 pb-1 border-b border-[#1E293B]">
              {children}
            </h2>
          );
        },
        h3({ children }) {
          return (
            <h3 className="text-sm font-medium text-[#E2E8F0] mt-3 mb-1.5">
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

// ---------------------------------------------------------------------------
// Submission Overlay
// ---------------------------------------------------------------------------
function SubmitOverlay({
  result,
  onClose,
}: {
  result: SubmitResult;
  onClose: () => void;
}) {
  const isAccepted = result.status === "accepted";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#0F0F23]/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-md mx-4 rounded-2xl border p-6 shadow-2xl",
          isAccepted
            ? "bg-[#1A1A2E] border-[#10B981]/30"
            : "bg-[#1A1A2E] border-[#EF4444]/30"
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#E2E8F0] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Status header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isAccepted ? "bg-[#10B981]/20" : "bg-[#EF4444]/20"
            )}
          >
            {isAccepted ? (
              <Trophy className="w-5 h-5 text-[#10B981]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#EF4444]" />
            )}
          </div>
          <div>
            <p
              className={cn(
                "text-lg font-bold",
                isAccepted ? "text-[#10B981]" : "text-[#EF4444]"
              )}
            >
              {isAccepted
                ? "Accepted"
                : result.status === "compile_error"
                ? "Compile Error"
                : result.status === "runtime_error"
                ? "Runtime Error"
                : "Wrong Answer"}
            </p>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {result.passed}/{result.total} test cases passed
            </p>
          </div>
        </div>

        {/* Stats row */}
        {isAccepted && (
          <div className="flex items-center gap-4 mb-5 p-3 bg-[#10B981]/5 border border-[#10B981]/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-xs text-[#94A3B8]">
                Runtime: <span className="text-[#E2E8F0] font-mono">{result.avgTimeMs.toFixed(0)} ms</span>
              </span>
            </div>
            <div className="w-px h-3 bg-[#1E293B]" />
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-xs text-[#94A3B8]">All tests passed</span>
            </div>
          </div>
        )}

        {/* Failed test cases */}
        {!isAccepted && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {result.results
              .filter((r) => !r.passed)
              .slice(0, 3)
              .map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg p-3 space-y-1"
                >
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-3 h-3 text-[#EF4444]" />
                    <span className="text-[11px] font-medium text-[#EF4444]">{r.label}</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#94A3B8]">
                    Expected: <span className="text-[#10B981]">{normalizeExpected(r.expected)}</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#94A3B8]">
                    Got: <span className="text-[#EF4444]">{r.actual || "(no output)"}</span>
                  </div>
                  {r.error && (
                    <div className="text-[11px] font-mono text-[#F59E0B] truncate">{r.error}</div>
                  )}
                </motion.div>
              ))}
          </div>
        )}

        <Button
          onClick={onClose}
          className={cn(
            "w-full mt-4 text-xs h-9",
            isAccepted
              ? "bg-[#10B981] hover:bg-[#10B981]/90 text-white"
              : "bg-[#1E293B] hover:bg-[#1E293B]/80 text-[#94A3B8]"
          )}
        >
          {isAccepted ? "Continue" : "Try Again"}
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ProblemSolver({
  question,
  previousCode,
  previousLanguage,
}: ProblemSolverProps) {
  const diff = DIFFICULTY_CONFIG[question.difficulty];

  // ─── Editor state ───────────────────────────────────────────────────────────
  const [language, setLanguage] = useState(previousLanguage ?? "python");
  const [code, setCode] = useState("");
  const initialCodeRef = useRef<Record<string, string>>({});

  // ─── Description panel state ────────────────────────────────────────────────
  const [activeDescTab, setActiveDescTab] = useState<"description" | "hints" | "solution">("description");
  const [shownHints, setShownHints] = useState(0);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [solutionConfirming, setSolutionConfirming] = useState(false);

  // ─── Console panel state ────────────────────────────────────────────────────
  const [activeConsoleTab, setActiveConsoleTab] = useState<"testcase" | "result">("testcase");
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  // Each entry = {paramName -> rawStringValue}
  const [caseInputs, setCaseInputs] = useState<CaseInputState[]>([]);
  const [customCaseLabels, setCustomCaseLabels] = useState<string[]>([]);

  // ─── Execution state ─────────────────────────────────────────────────────────
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState<RunResult[] | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [showSubmitOverlay, setShowSubmitOverlay] = useState(false);

  // ─── Timer ──────────────────────────────────────────────────────────────────
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(Date.now());

  // ─── Mobile view ─────────────────────────────────────────────────────────────
  const [mobileView, setMobileView] = useState<"problem" | "code">("problem");

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------
  const publicTestCases = (question.test_cases ?? []).filter((tc) => tc.isPublic);
  const allTestCases = question.test_cases ?? [];
  const params = question.params ?? [];
  const canExecute = Boolean(question.function_name && params.length > 0 && question.return_type);

  // Number of base cases (public ones from DB) vs custom ones added by user
  const baseCaseCount = publicTestCases.length;
  const totalCaseCount = caseInputs.length;

  // ---------------------------------------------------------------------------
  // Initialize code + test case inputs
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const starters = question.starter_code ?? {};
    initialCodeRef.current = starters;

    if (previousCode && previousLanguage === language) {
      setCode(previousCode);
    } else {
      setCode(starters[language] ?? `// Write your ${language} solution here\n`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Build editable inputs from public test cases
    const initial = publicTestCases.map((tc) => {
      const entry: CaseInputState = {};
      for (const [k, v] of Object.entries(tc.inputs)) {
        entry[k] = typeof v === "string" ? v : JSON.stringify(v);
      }
      return entry;
    });
    setCaseInputs(initial);
    setSelectedCaseIdx(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  // ---------------------------------------------------------------------------
  // Timer
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ---------------------------------------------------------------------------
  // Language change
  // ---------------------------------------------------------------------------
  const handleLanguageChange = useCallback(
    (newLang: string) => {
      const currentStarter = initialCodeRef.current[language] ?? "";
      if (code === currentStarter || code.trim() === "") {
        setCode(initialCodeRef.current[newLang] ?? `// Write your ${newLang} solution here\n`);
      }
      setLanguage(newLang);
    },
    [code, language]
  );

  // ---------------------------------------------------------------------------
  // Reset code
  // ---------------------------------------------------------------------------
  const handleReset = useCallback(() => {
    const starter = initialCodeRef.current[language] ?? `// Write your ${language} solution here\n`;
    setCode(starter);
    setRunResults(null);
    setSubmitResult(null);
    setActiveConsoleTab("testcase");
    toast.success("Code reset to starter template.");
  }, [language]);

  // ---------------------------------------------------------------------------
  // Parse editable input string to actual JS value
  // ---------------------------------------------------------------------------
  function parseInput(raw: string): unknown {
    const t = raw.trim();
    try {
      return JSON.parse(t);
    } catch {
      return t;
    }
  }

  // ---------------------------------------------------------------------------
  // Execute one test case — returns RunResult
  // ---------------------------------------------------------------------------
  async function executeOne(
    label: string,
    rawInputs: CaseInputState,
    expected: unknown
  ): Promise<RunResult> {
    const inputs: Record<string, unknown> = {};
    for (const p of params) {
      inputs[p.name] = parseInput(rawInputs[p.name] ?? "");
    }

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
          functionName: question.function_name,
          params: question.params,
          returnType: question.return_type,
          inputs,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          label,
          inputs,
          expected,
          actual: "",
          passed: false,
          error: data.error ?? "Execution failed",
          executionTime: 0,
        };
      }

      if (data.stderr && data.exitCode !== 0) {
        return {
          label,
          inputs,
          expected,
          actual: "",
          passed: false,
          error: data.stderr,
          executionTime: data.executionTime,
        };
      }

      const normalizedActual = data.normalized ?? data.stdout?.trim() ?? "";
      const normalizedExpectedStr = normalizeExpected(expected);
      const passed = normalizedActual === normalizedExpectedStr;

      return {
        label,
        inputs,
        expected,
        actual: normalizedActual,
        passed,
        executionTime: data.executionTime,
      };
    } catch {
      return {
        label,
        inputs,
        expected,
        actual: "",
        passed: false,
        error: "Network error. Is the execution service available?",
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Run — executes visible test case tabs
  // ---------------------------------------------------------------------------
  const handleRun = useCallback(async () => {
    if (!canExecute) {
      toast.error("This problem does not have execution metadata configured.");
      return;
    }

    setIsRunning(true);
    setRunResults(null);

    const results: RunResult[] = [];

    for (let i = 0; i < totalCaseCount; i++) {
      const isCustom = i >= baseCaseCount;
      const label = isCustom
        ? customCaseLabels[i - baseCaseCount] ?? `Custom ${i - baseCaseCount + 1}`
        : publicTestCases[i]?.label ?? `Case ${i + 1}`;
      const expected = isCustom ? null : publicTestCases[i]?.expected;
      const result = await executeOne(label, caseInputs[i] ?? {}, expected);
      results.push(result);
    }

    setRunResults(results);
    setActiveConsoleTab("result");
    setIsRunning(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canExecute, totalCaseCount, baseCaseCount, caseInputs, language, code]);

  // ---------------------------------------------------------------------------
  // Submit — runs ALL test cases including hidden ones
  // ---------------------------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    if (!canExecute) {
      toast.error("This problem does not have execution metadata configured.");
      return;
    }

    if (allTestCases.length === 0) {
      toast.error("No test cases available for this problem.");
      return;
    }

    setIsSubmitting(true);

    const results: RunResult[] = [];
    let totalTimeMs = 0;

    for (const tc of allTestCases) {
      const rawInputs: CaseInputState = {};
      for (const [k, v] of Object.entries(tc.inputs)) {
        rawInputs[k] = typeof v === "string" ? v : JSON.stringify(v);
      }
      const result = await executeOne(tc.label, rawInputs, tc.expected);
      results.push(result);
      if (result.executionTime) totalTimeMs += result.executionTime * 1000;
    }

    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    const hasError = results.some((r) => r.error);
    const allPassed = passed === total;

    const status: SubmitResult["status"] = allPassed
      ? "accepted"
      : hasError
      ? results.some((r) => r.error?.toLowerCase().includes("compile"))
        ? "compile_error"
        : "runtime_error"
      : "wrong_answer";

    const finalResult: SubmitResult = {
      status,
      passed,
      total,
      results,
      avgTimeMs: total > 0 ? totalTimeMs / total : 0,
    };

    setSubmitResult(finalResult);
    setShowSubmitOverlay(true);
    setIsSubmitting(false);

    // Save completion if accepted
    if (allPassed) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("question_completions").upsert(
            {
              user_id: user.id,
              question_id: question.id,
              language,
              code,
              passed_tests: passed,
              total_tests: total,
              time_ms: finalResult.avgTimeMs,
            },
            { onConflict: "user_id,question_id" }
          );
        }
      } catch {
        // Silent fail for completion save
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canExecute, allTestCases, language, code, question.id]);

  // ---------------------------------------------------------------------------
  // Add custom test case
  // ---------------------------------------------------------------------------
  const handleAddCase = () => {
    const template: CaseInputState = {};
    for (const p of params) {
      template[p.name] = caseInputs[0]?.[p.name] ?? "";
    }
    const label = `Custom ${caseInputs.length - baseCaseCount + 1}`;
    setCaseInputs((prev) => [...prev, template]);
    setCustomCaseLabels((prev) => [...prev, label]);
    setSelectedCaseIdx(caseInputs.length);
  };

  const handleRemoveCustomCase = (absIdx: number) => {
    const relIdx = absIdx - baseCaseCount;
    setCaseInputs((prev) => prev.filter((_, i) => i !== absIdx));
    setCustomCaseLabels((prev) => prev.filter((_, i) => i !== relIdx));
    setSelectedCaseIdx(Math.max(0, absIdx - 1));
  };

  // ---------------------------------------------------------------------------
  // Keyboard shortcut: Ctrl/Cmd+Enter → Run
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning && !isSubmitting) handleRun();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRun, isRunning, isSubmitting]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const runResultForCase = (idx: number) => runResults?.[idx] ?? null;

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------
  return (
    <div className="h-full flex flex-col bg-[#0F0F23] relative">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E293B] bg-[#1A1A2E] shrink-0 gap-4">
        {/* Left: breadcrumb + title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/practice"
            className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#E2E8F0] transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Problems</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#1E293B] shrink-0" />
          <h1 className="text-sm font-semibold text-[#E2E8F0] truncate">
            {question.question_number ? `${question.question_number}. ` : ""}
            {question.title}
          </h1>
          {diff && (
            <Badge
              variant="outline"
              className={cn("text-[10px] font-medium shrink-0 px-2 py-0.5", diff.cls)}
            >
              {diff.label}
            </Badge>
          )}
        </div>

        {/* Right: mobile toggle + timer + run/submit */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile view toggle */}
          <div className="flex sm:hidden items-center bg-[#16213E] border border-[#1E293B] rounded-lg p-0.5">
            {(["problem", "code"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setMobileView(view)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors",
                  mobileView === view
                    ? "bg-[#6C3CE1] text-white"
                    : "text-[#94A3B8] hover:text-[#E2E8F0]"
                )}
              >
                {view}
              </button>
            ))}
          </div>

          {/* Timer */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#94A3B8]/60">
            <Timer className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{formatTime(elapsed)}</span>
          </div>

          {/* Run */}
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="h-7 px-3 text-xs bg-transparent border border-[#10B981]/50 text-[#10B981] hover:bg-[#10B981]/10 gap-1.5 transition-all"
          >
            {isRunning ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">Run</span>
          </Button>

          {/* Submit */}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="h-7 px-3 text-xs bg-[#6C3CE1] hover:bg-[#6C3CE1]/90 text-white gap-1.5 transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">Submit</span>
          </Button>
        </div>
      </div>

      {/* ── Main split layout ────────────────────────────────────────────────── */}
      <PanelGroup orientation="horizontal" className="flex-1 min-h-0">

        {/* ── LEFT PANEL: Problem description ─────────────────────────────── */}
        <Panel
          defaultSize={42}
          minSize={24}
          className={cn(
            "flex flex-col min-h-0",
            mobileView === "code" && "hidden sm:flex"
          )}
        >
          {/* Tab bar */}
          <div className="flex items-center gap-0 px-1 border-b border-[#1E293B] bg-[#1A1A2E] shrink-0">
            {(
              [
                { key: "description", label: "Description", icon: BookOpen },
                { key: "hints",       label: "Hints",       icon: Lightbulb },
                { key: "solution",    label: "Solution",    icon: Code2 },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveDescTab(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors",
                  activeDescTab === tab.key
                    ? "border-[#6C3CE1] text-[#8B5CF6]"
                    : "border-transparent text-[#94A3B8] hover:text-[#E2E8F0]"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.key === "hints" && question.hints.length > 0 && (
                  <span className="ml-0.5 text-[10px] bg-[#6C3CE1]/20 text-[#8B5CF6] rounded-full px-1.5 py-0.5">
                    {question.hints.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* ── Description tab ── */}
              {activeDescTab === "description" && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="p-5 space-y-5"
                >
                  {/* Problem title + difficulty */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {diff && (
                        <span className={cn("text-xs font-medium", diff.cls.split(" ")[0])}>
                          {diff.label}
                        </span>
                      )}
                    </div>

                    {/* Topic tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {question.topic_tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-[#16213E] text-[#94A3B8] border border-[#1E293B] hover:border-[#6C3CE1]/40 hover:text-[#E2E8F0] transition-colors cursor-default"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Problem statement */}
                  <div>
                    <MarkdownBody content={question.description} />
                  </div>

                  {/* Company tags */}
                  {question.company_tags.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium text-[#94A3B8]/60 uppercase tracking-wider mb-2">
                        Companies
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {question.company_tags.map((company) => (
                          <span
                            key={company}
                            className="text-[10px] px-2.5 py-1 rounded-full bg-[#6C3CE1]/10 text-[#8B5CF6] border border-[#6C3CE1]/20"
                          >
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Hints tab ── */}
              {activeDescTab === "hints" && (
                <motion.div
                  key="hints"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="p-5 space-y-3"
                >
                  {question.hints.length === 0 && (
                    <p className="text-xs text-[#94A3B8]/50 text-center py-8">
                      No hints available for this problem.
                    </p>
                  )}
                  {question.hints.map((hint, i) => {
                    if (i < shownHints) {
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-[#16213E] border border-[#6C3CE1]/20 rounded-xl p-4 space-y-1.5"
                        >
                          <p className="text-[11px] font-semibold text-[#8B5CF6] uppercase tracking-wider">
                            Hint {i + 1}
                          </p>
                          <p className="text-sm text-[#94A3B8] leading-relaxed">{hint}</p>
                        </motion.div>
                      );
                    }
                    if (i === shownHints) {
                      return (
                        <button
                          key={i}
                          onClick={() => setShownHints((n) => n + 1)}
                          className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border border-dashed border-[#1E293B] hover:border-[#6C3CE1]/40 text-xs text-[#94A3B8] hover:text-[#8B5CF6] transition-all group"
                        >
                          <div className="w-6 h-6 rounded-full bg-[#6C3CE1]/10 flex items-center justify-center group-hover:bg-[#6C3CE1]/20 transition-colors">
                            <Lightbulb className="w-3 h-3 text-[#8B5CF6]" />
                          </div>
                          Reveal Hint {i + 1}
                        </button>
                      );
                    }
                    return (
                      <div
                        key={i}
                        className="px-4 py-3 rounded-xl border border-dashed border-[#1E293B]/60 text-xs text-[#94A3B8]/30"
                      >
                        Hint {i + 1} — locked
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* ── Solution tab ── */}
              {activeDescTab === "solution" && (
                <motion.div
                  key="solution"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="p-5"
                >
                  {!question.solution ? (
                    <p className="text-xs text-[#94A3B8]/50 text-center py-8">
                      No editorial solution available for this problem.
                    </p>
                  ) : !solutionVisible ? (
                    <div className="space-y-3">
                      {!solutionConfirming ? (
                        <button
                          onClick={() => setSolutionConfirming(true)}
                          className="flex items-center gap-2 text-xs text-[#8B5CF6] hover:text-[#6C3CE1] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Reveal Solution
                        </button>
                      ) : (
                        <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-4 space-y-3">
                          <p className="text-xs text-[#F59E0B]/80 leading-relaxed">
                            Revealing the solution before attempting may reduce your learning.
                            Try working through it first.
                          </p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => setSolutionConfirming(false)}
                              className="text-xs text-[#94A3B8] hover:text-[#E2E8F0] transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                setSolutionVisible(true);
                                setSolutionConfirming(false);
                              }}
                              className="text-xs text-[#F59E0B] hover:text-[#F59E0B]/80 font-medium transition-colors"
                            >
                              Show anyway
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => { setSolutionVisible(false); setSolutionConfirming(false); }}
                        className="flex items-center gap-1.5 text-xs text-[#94A3B8]/50 hover:text-[#94A3B8] transition-colors"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        Hide Solution
                      </button>
                      <MarkdownBody content={question.solution} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Panel>

        {/* ── Resize handle ─────────────────────────────────────────────────── */}
        <PanelResizeHandle className="w-1 bg-[#1E293B] hover:bg-[#6C3CE1]/50 active:bg-[#6C3CE1] transition-colors hidden sm:flex items-center justify-center group cursor-col-resize">
          <div className="w-0.5 h-8 rounded-full bg-[#1E293B] group-hover:bg-[#6C3CE1]/60 group-active:bg-[#6C3CE1] transition-colors" />
        </PanelResizeHandle>

        {/* ── RIGHT PANEL: Editor + Console ──────────────────────────────────── */}
        <Panel
          defaultSize={58}
          minSize={32}
          className={cn(
            "flex flex-col min-h-0",
            mobileView === "problem" && "hidden sm:flex"
          )}
        >
          <PanelGroup orientation="vertical">

            {/* ── Editor pane ─────────────────────────────────────────────── */}
            <Panel defaultSize={62} minSize={25} className="flex flex-col min-h-0">
              {/* Editor toolbar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#1E293B] bg-[#1A1A2E] shrink-0">
                <div className="flex items-center gap-2">
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="h-7 text-xs w-34 bg-[#16213E] border-[#1E293B] text-[#94A3B8] hover:border-[#6C3CE1]/40 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A2E] border-[#1E293B] text-[#E2E8F0]">
                      {LANGUAGES.map((lang) => (
                        <SelectItem
                          key={lang.value}
                          value={lang.value}
                          className="text-xs hover:bg-[#16213E] focus:bg-[#16213E]"
                        >
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <button
                    onClick={handleReset}
                    title="Reset to starter code"
                    className="w-7 h-7 flex items-center justify-center rounded-md text-[#94A3B8]/50 hover:text-[#94A3B8] hover:bg-[#16213E] transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-[#94A3B8]/40 font-mono">
                  <span className="hidden sm:inline">⌘+Enter to run</span>
                </div>
              </div>

              {/* Monaco editor */}
              <div className="flex-1 min-h-0">
                <MonacoEditor
                  height="100%"
                  language={LANGUAGES.find((l) => l.value === language)?.monacoLang ?? "python"}
                  value={code}
                  onChange={(val) => setCode(val ?? "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    padding: { top: 12, bottom: 12 },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    tabSize: 4,
                    insertSpaces: true,
                    automaticLayout: true,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    fontLigatures: true,
                    renderLineHighlight: "line",
                    cursorBlinking: "smooth",
                    smoothScrolling: true,
                    contextmenu: false,
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    scrollbar: {
                      verticalScrollbarSize: 6,
                      horizontalScrollbarSize: 6,
                    },
                  }}
                />
              </div>
            </Panel>

            {/* ── Resize handle (vertical) ───────────────────────────────── */}
            <PanelResizeHandle className="h-1 bg-[#1E293B] hover:bg-[#6C3CE1]/50 active:bg-[#6C3CE1] transition-colors flex items-center justify-center group cursor-row-resize">
              <div className="h-0.5 w-8 rounded-full bg-[#1E293B] group-hover:bg-[#6C3CE1]/60 transition-colors" />
            </PanelResizeHandle>

            {/* ── Console pane ─────────────────────────────────────────────── */}
            <Panel defaultSize={38} minSize={18} className="flex flex-col min-h-0 bg-[#1A1A2E]">

              {/* Console tab bar + status */}
              <div className="flex items-center justify-between border-b border-[#1E293B] shrink-0 px-1">
                <div className="flex items-center">
                  {(
                    [
                      { key: "testcase", label: "Test Cases" },
                      { key: "result",   label: "Test Result" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveConsoleTab(tab.key)}
                      className={cn(
                        "px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors",
                        activeConsoleTab === tab.key
                          ? "border-[#6C3CE1] text-[#8B5CF6]"
                          : "border-transparent text-[#94A3B8] hover:text-[#E2E8F0]"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Run status badge */}
                {runResults && activeConsoleTab === "result" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 pr-3"
                  >
                    {runResults.every((r) => r.passed) ? (
                      <span className="text-[11px] text-[#10B981] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {runResults.filter((r) => r.passed).length}/{runResults.length} passed
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {runResults.filter((r) => r.passed).length}/{runResults.length} passed
                      </span>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Console content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <AnimatePresence mode="wait">

                  {/* ── Test Cases tab ────────────────────────────────────── */}
                  {activeConsoleTab === "testcase" && (
                    <motion.div
                      key="testcase"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="flex flex-col h-full"
                    >
                      {/* Case pills */}
                      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#1E293B] overflow-x-auto shrink-0">
                        {Array.from({ length: totalCaseCount }).map((_, i) => {
                          const isCustom = i >= baseCaseCount;
                          const label = isCustom
                            ? customCaseLabels[i - baseCaseCount] ?? `Custom ${i - baseCaseCount + 1}`
                            : publicTestCases[i]?.label ?? `Case ${i + 1}`;
                          return (
                            <div key={i} className="flex items-center gap-0.5">
                              <button
                                onClick={() => setSelectedCaseIdx(i)}
                                className={cn(
                                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all",
                                  selectedCaseIdx === i
                                    ? "bg-[#16213E] text-[#E2E8F0] border border-[#6C3CE1]/30"
                                    : "text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#16213E]/50"
                                )}
                              >
                                {label}
                              </button>
                              {isCustom && (
                                <button
                                  onClick={() => handleRemoveCustomCase(i)}
                                  className="w-4 h-4 flex items-center justify-center rounded text-[#94A3B8]/40 hover:text-[#EF4444] transition-colors"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {/* Add case button */}
                        {canExecute && (
                          <button
                            onClick={handleAddCase}
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-[#94A3B8]/50 hover:text-[#8B5CF6] hover:bg-[#6C3CE1]/10 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Editable inputs */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {!canExecute ? (
                          <p className="text-xs text-[#94A3B8]/40 text-center py-6">
                            Code execution is not available for this problem type.
                          </p>
                        ) : params.length === 0 ? (
                          <p className="text-xs text-[#94A3B8]/40 text-center py-6">
                            No parameters defined.
                          </p>
                        ) : (
                          params.map((p) => (
                            <div key={p.name}>
                              <label className="block text-[11px] font-medium text-[#94A3B8]/70 mb-1.5">
                                <span className="text-[#8B5CF6]">{p.name}</span>
                                <span className="ml-1.5 text-[#94A3B8]/40 font-normal">
                                  = {p.type}
                                </span>
                              </label>
                              <textarea
                                value={caseInputs[selectedCaseIdx]?.[p.name] ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCaseInputs((prev) => {
                                    const next = [...prev];
                                    next[selectedCaseIdx] = {
                                      ...(next[selectedCaseIdx] ?? {}),
                                      [p.name]: val,
                                    };
                                    return next;
                                  });
                                }}
                                rows={1}
                                className="w-full bg-[#0F0F23] border border-[#1E293B] rounded-lg px-3 py-2 text-xs font-mono text-[#E2E8F0] resize-none focus:outline-none focus:border-[#6C3CE1]/50 transition-colors placeholder:text-[#94A3B8]/30"
                                style={{ minHeight: "36px", maxHeight: "96px" }}
                                onInput={(e) => {
                                  const t = e.currentTarget;
                                  t.style.height = "auto";
                                  t.style.height = Math.min(t.scrollHeight, 96) + "px";
                                }}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* ── Test Result tab ───────────────────────────────────── */}
                  {activeConsoleTab === "result" && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="flex flex-col h-full"
                    >
                      {isRunning ? (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-5 h-5 text-[#6C3CE1] animate-spin" />
                            <span className="text-xs text-[#94A3B8]">Executing code...</span>
                          </div>
                        </div>
                      ) : !runResults ? (
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-xs text-[#94A3B8]/40">
                            Click Run to see results
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Result case pills */}
                          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#1E293B] overflow-x-auto shrink-0">
                            {runResults.map((result, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedCaseIdx(i)}
                                className={cn(
                                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all",
                                  selectedCaseIdx === i
                                    ? "bg-[#16213E] border border-[#1E293B]"
                                    : "text-[#94A3B8] hover:bg-[#16213E]/50"
                                )}
                              >
                                {result.passed ? (
                                  <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-[#EF4444]" />
                                )}
                                <span className={result.passed ? "text-[#10B981]" : "text-[#EF4444]"}>
                                  {result.label}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Selected result detail */}
                          <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {(() => {
                              const res = runResultForCase(selectedCaseIdx);
                              if (!res) return null;

                              return (
                                <motion.div
                                  key={selectedCaseIdx}
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="space-y-2.5"
                                >
                                  {/* Status badge */}
                                  <div
                                    className={cn(
                                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold",
                                      res.passed
                                        ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                                        : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                                    )}
                                  >
                                    {res.passed ? (
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5" />
                                    )}
                                    {res.passed ? "Accepted" : "Wrong Answer"}
                                    {res.executionTime && (
                                      <span className="text-[10px] font-normal opacity-70">
                                        {(res.executionTime * 1000).toFixed(0)} ms
                                      </span>
                                    )}
                                  </div>

                                  {/* Input */}
                                  <div className="space-y-1">
                                    <p className="text-[11px] text-[#94A3B8]/50 font-medium uppercase tracking-wider">
                                      Input
                                    </p>
                                    {params.map((p) => (
                                      <div key={p.name} className="flex gap-2 text-[11px] font-mono">
                                        <span className="text-[#8B5CF6]">{p.name}</span>
                                        <span className="text-[#94A3B8]/50">=</span>
                                        <span className="text-[#E2E8F0]">
                                          {typeof res.inputs[p.name] === "object"
                                            ? JSON.stringify(res.inputs[p.name])
                                            : String(res.inputs[p.name])}
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Output */}
                                  <div className="space-y-1">
                                    <p className="text-[11px] text-[#94A3B8]/50 font-medium uppercase tracking-wider">
                                      Output
                                    </p>
                                    <div
                                      className={cn(
                                        "text-[11px] font-mono px-2 py-1 rounded bg-[#0F0F23] border border-[#1E293B]",
                                        res.error ? "text-[#EF4444]" : res.passed ? "text-[#10B981]" : "text-[#EF4444]"
                                      )}
                                    >
                                      {res.error ? res.error : res.actual || "(no output)"}
                                    </div>
                                  </div>

                                  {/* Expected (only show if mismatch) */}
                                  {res.expected !== null && res.expected !== undefined && !res.passed && (
                                    <div className="space-y-1">
                                      <p className="text-[11px] text-[#94A3B8]/50 font-medium uppercase tracking-wider">
                                        Expected
                                      </p>
                                      <div className="text-[11px] font-mono px-2 py-1 rounded bg-[#0F0F23] border border-[#10B981]/20 text-[#10B981]">
                                        {normalizeExpected(res.expected)}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })()}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>

      {/* ── Submit overlay ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSubmitOverlay && submitResult && (
          <SubmitOverlay
            result={submitResult}
            onClose={() => setShowSubmitOverlay(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Full-screen loading overlay while submitting ──────────────────────── */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-[#0F0F23]/70 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-[#6C3CE1]/20" />
                <div className="absolute inset-0 rounded-full border-2 border-[#6C3CE1] border-t-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#E2E8F0]">Submitting solution</p>
                <p className="text-xs text-[#94A3B8] mt-1">Running all test cases...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
