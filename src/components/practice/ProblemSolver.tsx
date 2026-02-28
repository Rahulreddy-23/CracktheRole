"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    Play,
    Send,
    RotateCcw,
    Timer,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Loader2,
    Lightbulb,
    BookOpen,
    Code2,
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

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-surface2">
            <Loader2 className="w-5 h-5 text-text-secondary/40 animate-spin" />
        </div>
    ),
});

// Types
interface TestCase {
    input: string;
    expected_output: string;
}

interface TestResult {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
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
    test_cases: TestCase[] | null;
    question_number: number | null;
}

interface ProblemSolverProps {
    question: QuestionData;
    previousCode: string | null;
    previousLanguage: string | null;
}

// Language config
const LANGUAGES = [
    { value: "python", label: "Python", monacoLang: "python" },
    { value: "javascript", label: "JavaScript", monacoLang: "javascript" },
    { value: "java", label: "Java", monacoLang: "java" },
    { value: "cpp", label: "C++", monacoLang: "cpp" },
];

const DIFFICULTY_CONFIG: Record<string, { label: string; class: string }> = {
    easy: { label: "Easy", class: "bg-brand-success/15 text-brand-success border-brand-success/30" },
    medium: { label: "Medium", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
    hard: { label: "Hard", class: "bg-brand-danger/15 text-brand-danger border-brand-danger/30" },
};

// Markdown renderer (same as QuestionExpanded)
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

export default function ProblemSolver({
    question,
    previousCode,
    previousLanguage,
}: ProblemSolverProps) {
    // State
    const [activeTab, setActiveTab] = useState<"description" | "hints" | "solution">("description");
    const [language, setLanguage] = useState(previousLanguage || "python");
    const [code, setCode] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
    const [consoleError, setConsoleError] = useState<string | null>(null);
    const [executionTime, setExecutionTime] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<TestResult[] | null>(null);
    const [shownHints, setShownHints] = useState(0);
    const [solutionVisible, setSolutionVisible] = useState(false);
    const [solutionConfirming, setSolutionConfirming] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [mobileView, setMobileView] = useState<"problem" | "code">("problem");

    const initialCodeRef = useRef<Record<string, string>>({});
    const startTimeRef = useRef(Date.now());

    const diff = DIFFICULTY_CONFIG[question.difficulty];

    // Initialize code
    useEffect(() => {
        const starterCodes = question.starter_code ?? {};
        initialCodeRef.current = starterCodes;

        if (previousCode && previousLanguage === language) {
            setCode(previousCode);
        } else {
            setCode(starterCodes[language] || `// Write your ${language} solution here\n`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // Language change handler
    const handleLanguageChange = useCallback(
        (newLang: string) => {
            const currentStarter = initialCodeRef.current[language] || "";
            // Only swap if code is still the default starter
            if (code === currentStarter || code === "") {
                setCode(initialCodeRef.current[newLang] || `// Write your ${newLang} solution here\n`);
            }
            setLanguage(newLang);
        },
        [code, language]
    );

    // Reset code
    const handleReset = useCallback(() => {
        const starter = initialCodeRef.current[language] || `// Write your ${language} solution here\n`;
        setCode(starter);
        setConsoleOutput(null);
        setConsoleError(null);
        setTestResults(null);
        setExecutionTime(null);
        toast.success("Code reset to starter template.");
    }, [language]);

    // Run code (single execution)
    const handleRun = useCallback(async () => {
        setIsRunning(true);
        setConsoleOutput(null);
        setConsoleError(null);
        setTestResults(null);
        setExecutionTime(null);

        try {
            const res = await fetch("/api/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language, code }),
            });

            const data = await res.json();

            if (!res.ok) {
                setConsoleError(data.error || "Execution failed");
                return;
            }

            setConsoleOutput(data.stdout || "(no output)");
            if (data.stderr) setConsoleError(data.stderr);
            if (data.executionTime) setExecutionTime(data.executionTime);
        } catch {
            setConsoleError("Failed to connect to execution service.");
        } finally {
            setIsRunning(false);
        }
    }, [language, code]);

    // Submit — run against test cases
    const handleSubmit = useCallback(async () => {
        const testCases = question.test_cases;
        if (!testCases || testCases.length === 0) {
            toast.error("No test cases available for this problem.");
            return;
        }

        setIsSubmitting(true);
        setTestResults(null);
        setConsoleOutput(null);
        setConsoleError(null);

        const results: TestResult[] = [];

        for (const tc of testCases) {
            try {
                const res = await fetch("/api/execute", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ language, code, stdin: tc.input }),
                });

                const data = await res.json();
                const actual = (data.stdout || "").trim();

                results.push({
                    input: tc.input,
                    expected: tc.expected_output,
                    actual,
                    passed: actual === tc.expected_output.trim(),
                });
            } catch {
                results.push({
                    input: tc.input,
                    expected: tc.expected_output,
                    actual: "Error",
                    passed: false,
                });
            }
        }

        setTestResults(results);
        setIsSubmitting(false);

        const passed = results.filter((r) => r.passed).length;
        const total = results.length;

        if (passed === total) {
            toast.success(`🎉 All ${total} test cases passed!`);
            // Save completion
            try {
                const supabase = createClient();
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                    await supabase
                        .from("question_completions")
                        .upsert(
                            {
                                user_id: user.id,
                                question_id: question.id,
                                language,
                                code,
                                passed_tests: passed,
                                total_tests: total,
                            },
                            { onConflict: "user_id,question_id" }
                        );
                }
            } catch {
                // Silent fail for completion save
            }
        } else {
            toast.error(`${passed}/${total} test cases passed.`);
        }
    }, [language, code, question.test_cases, question.id]);

    // Keyboard shortcut
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

    return (
        <div className="h-full flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-surface shrink-0">
                <div className="flex items-center gap-3">
                    <Link
                        href="/practice"
                        className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                        aria-label="Back to question bank"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Problems</span>
                    </Link>
                    <span className="text-border/60">|</span>
                    <h1 className="text-sm font-semibold text-text-primary truncate max-w-xs sm:max-w-sm">
                        {question.question_number ? `${question.question_number}. ` : ""}
                        {question.title}
                    </h1>
                    {diff && (
                        <Badge variant="outline" className={cn("text-[10px] font-medium", diff.class)}>
                            {diff.label}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary/60">
                        <Timer className="w-3.5 h-3.5" />
                        <span className="font-mono">{formatTime(elapsedSeconds)}</span>
                    </div>

                    {/* Mobile view toggle */}
                    <div className="flex items-center gap-0.5 sm:hidden bg-surface2 border border-border/40 rounded-lg p-0.5">
                        <button
                            onClick={() => setMobileView("problem")}
                            className={cn(
                                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                                mobileView === "problem" ? "bg-brand-primary text-white" : "text-text-secondary"
                            )}
                        >
                            Problem
                        </button>
                        <button
                            onClick={() => setMobileView("code")}
                            className={cn(
                                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                                mobileView === "code" ? "bg-brand-primary text-white" : "text-text-secondary"
                            )}
                        >
                            Code
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content — split pane */}
            <PanelGroup orientation="horizontal" className="flex-1 min-h-0">
                {/* Left pane — Problem description */}
                <Panel
                    defaultSize={45}
                    minSize={25}
                    className={cn(
                        "flex flex-col min-h-0 border-r border-border/40",
                        mobileView === "code" && "hidden sm:flex"
                    )}
                >
                    {/* Tabs */}
                    <div className="flex items-center gap-0.5 px-3 pt-2 border-b border-border/30 bg-surface shrink-0">
                        {([
                            { key: "description", label: "Description", icon: BookOpen },
                            { key: "hints", label: "Hints", icon: Lightbulb },
                            { key: "solution", label: "Solution", icon: Code2 },
                        ] as const).map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px",
                                    activeTab === tab.key
                                        ? "border-brand-primary text-brand-primary-light"
                                        : "border-transparent text-text-secondary hover:text-text-primary"
                                )}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {activeTab === "description" && (
                            <>
                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5">
                                    {question.topic_tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[10px] px-2 py-0.5 rounded-full bg-surface2 text-text-secondary/70 border border-border/30"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {question.company_tags.slice(0, 4).map((company) => (
                                        <span
                                            key={company}
                                            className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary-light border border-brand-primary/20"
                                        >
                                            {company}
                                        </span>
                                    ))}
                                </div>

                                {/* Problem statement */}
                                <MarkdownBody content={question.description} />

                                {/* Example test cases */}
                                {question.test_cases && question.test_cases.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-semibold text-text-primary">Examples</h3>
                                        {question.test_cases.slice(0, 3).map((tc, i) => (
                                            <div
                                                key={i}
                                                className="bg-surface2/50 border border-border/30 rounded-lg p-3 space-y-1.5"
                                            >
                                                <p className="text-xs text-text-secondary/60 font-medium">
                                                    Example {i + 1}
                                                </p>
                                                <div className="text-xs font-mono">
                                                    <span className="text-text-secondary/50">Input: </span>
                                                    <span className="text-text-primary">{tc.input}</span>
                                                </div>
                                                <div className="text-xs font-mono">
                                                    <span className="text-text-secondary/50">Output: </span>
                                                    <span className="text-brand-success">{tc.expected_output}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === "hints" && (
                            <div className="space-y-3">
                                {question.hints.length === 0 && (
                                    <p className="text-xs text-text-secondary/60">
                                        No hints available for this problem.
                                    </p>
                                )}
                                {question.hints.map((hint, i) => (
                                    <div key={i}>
                                        {i < shownHints ? (
                                            <div className="bg-surface2/40 border border-border/30 rounded-lg p-3 space-y-1">
                                                <p className="text-xs font-medium text-brand-primary-light">
                                                    Hint {i + 1}
                                                </p>
                                                <p className="text-sm text-text-secondary leading-relaxed">{hint}</p>
                                            </div>
                                        ) : i === shownHints ? (
                                            <button
                                                onClick={() => setShownHints((prev) => prev + 1)}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border/50 text-xs text-text-secondary hover:text-brand-primary-light hover:border-brand-primary/30 transition-colors w-full"
                                            >
                                                <Lightbulb className="w-3.5 h-3.5" />
                                                Reveal Hint {i + 1}
                                            </button>
                                        ) : (
                                            <div className="px-3 py-2 rounded-lg border border-dashed border-border/30 text-xs text-text-secondary/40">
                                                Hint {i + 1} — locked
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "solution" && (
                            <div>
                                {!question.solution ? (
                                    <p className="text-xs text-text-secondary/60">
                                        No editorial solution available for this problem.
                                    </p>
                                ) : !solutionVisible ? (
                                    <div className="space-y-3">
                                        {!solutionConfirming ? (
                                            <button
                                                onClick={() => setSolutionConfirming(true)}
                                                className="flex items-center gap-2 text-xs text-brand-primary-light hover:text-brand-primary transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Reveal Solution
                                            </button>
                                        ) : (
                                            <div className="bg-brand-warning/5 border border-brand-warning/20 rounded-lg p-4 space-y-3">
                                                <p className="text-xs text-brand-warning/80 leading-relaxed">
                                                    Revealing the solution before attempting the problem may
                                                    reduce your learning. Try working through it first.
                                                </p>
                                                <div className="flex items-center gap-3">
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
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                setSolutionVisible(false);
                                                setSolutionConfirming(false);
                                            }}
                                            className="flex items-center gap-1.5 text-xs text-text-secondary/50 hover:text-text-secondary transition-colors"
                                        >
                                            <EyeOff className="w-3.5 h-3.5" />
                                            Hide Solution
                                        </button>
                                        <MarkdownBody content={question.solution} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Panel>

                <PanelResizeHandle className="w-1.5 bg-transparent hover:bg-brand-primary/20 hover:cursor-col-resize active:bg-brand-primary/40 transition-colors hidden sm:flex items-center justify-center -ml-[3px] -mr-[3px] z-10 relative">
                    <div className="w-1 h-8 rounded-full bg-border/50 hover:bg-brand-primary/60 transition-colors" />
                </PanelResizeHandle>

                {/* Right pane — Code editor + Console */}
                <Panel
                    defaultSize={55}
                    minSize={30}
                    className={cn(
                        "flex flex-col min-h-0",
                        mobileView === "problem" && "hidden sm:flex"
                    )}
                >
                    <PanelGroup orientation="vertical">
                        <Panel defaultSize={65} minSize={20} className="flex flex-col min-h-0">
                            {/* Editor toolbar */}
                            <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-surface shrink-0">
                                <div className="flex items-center gap-2">
                                    <Select value={language} onValueChange={handleLanguageChange}>
                                        <SelectTrigger className="h-7 text-xs w-32 bg-surface2 border-border/40 text-text-secondary">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-surface border-border/50 text-text-primary">
                                            {LANGUAGES.map((lang) => (
                                                <SelectItem key={lang.value} value={lang.value} className="text-xs">
                                                    {lang.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={handleReset}
                                        className="text-text-secondary/50 hover:text-text-primary"
                                        aria-label="Reset code"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={handleRun}
                                        disabled={isRunning || isSubmitting}
                                        className="bg-brand-success/20 text-brand-success hover:bg-brand-success/30 border border-brand-success/30 text-xs h-7 px-3 gap-1"
                                    >
                                        {isRunning ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Play className="w-3 h-3" />
                                        )}
                                        Run
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSubmit}
                                        disabled={isRunning || isSubmitting}
                                        className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs h-7 px-3 gap-1"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Send className="w-3 h-3" />
                                        )}
                                        Submit
                                    </Button>
                                </div>
                            </div>

                            {/* Monaco Editor — ~65% of the right pane */}
                            <div className="flex-[65] min-h-0">
                                <MonacoEditor
                                    height="100%"
                                    language={LANGUAGES.find((l) => l.value === language)?.monacoLang || "python"}
                                    value={code}
                                    onChange={(val) => setCode(val ?? "")}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: "on",
                                        padding: { top: 12 },
                                        scrollBeyondLastLine: false,
                                        wordWrap: "on",
                                        tabSize: 4,
                                        insertSpaces: true,
                                        automaticLayout: true,
                                    }}
                                />
                            </div>
                        </Panel>

                        <PanelResizeHandle className="h-1.5 bg-transparent hover:bg-brand-primary/20 hover:cursor-row-resize active:bg-brand-primary/40 transition-colors flex items-center justify-center -mt-[3px] -mb-[3px] z-10 relative">
                            <div className="h-1 w-8 rounded-full bg-border/50 hover:bg-brand-primary/60 transition-colors" />
                        </PanelResizeHandle>

                        {/* Console panel */}
                        <Panel defaultSize={35} minSize={15} className="border-t border-border/40 bg-surface flex flex-col min-h-0">
                            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 shrink-0">
                                <span className="text-xs font-medium text-text-secondary">Console</span>
                                {executionTime && (
                                    <span className="text-[10px] text-text-secondary/50 font-mono">
                                        {executionTime}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {/* Test results */}
                                {testResults && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-semibold text-text-primary">
                                                Test Results:
                                            </span>
                                            <span
                                                className={cn(
                                                    "text-xs font-medium",
                                                    testResults.every((r) => r.passed)
                                                        ? "text-brand-success"
                                                        : "text-brand-danger"
                                                )}
                                            >
                                                {testResults.filter((r) => r.passed).length}/{testResults.length} passed
                                            </span>
                                        </div>

                                        {testResults.map((result, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "border rounded-lg p-2.5 space-y-1",
                                                    result.passed
                                                        ? "border-brand-success/30 bg-brand-success/5"
                                                        : "border-brand-danger/30 bg-brand-danger/5"
                                                )}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    {result.passed ? (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
                                                    ) : (
                                                        <XCircle className="w-3.5 h-3.5 text-brand-danger" />
                                                    )}
                                                    <span className="text-[11px] font-medium text-text-primary">
                                                        Test Case {i + 1}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] font-mono text-text-secondary/70">
                                                    Input: {result.input}
                                                </div>
                                                <div className="text-[11px] font-mono text-text-secondary/70">
                                                    Expected: <span className="text-brand-success">{result.expected}</span>
                                                </div>
                                                {!result.passed && (
                                                    <div className="text-[11px] font-mono text-text-secondary/70">
                                                        Actual: <span className="text-brand-danger">{result.actual}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Console output */}
                                {consoleOutput && !testResults && (
                                    <pre className="text-xs font-mono text-brand-success whitespace-pre-wrap">
                                        {consoleOutput}
                                    </pre>
                                )}

                                {/* Console error */}
                                {consoleError && (
                                    <pre className="text-xs font-mono text-brand-danger whitespace-pre-wrap">
                                        {consoleError}
                                    </pre>
                                )}

                                {/* Placeholder */}
                                {!consoleOutput && !consoleError && !testResults && !isRunning && !isSubmitting && (
                                    <p className="text-xs text-text-secondary/40 text-center py-4">
                                        Run your code to see output (⌘+Enter)
                                    </p>
                                )}

                                {/* Loading states */}
                                {(isRunning || isSubmitting) && (
                                    <div className="flex items-center justify-center gap-2 py-4">
                                        <Loader2 className="w-4 h-4 text-text-secondary/40 animate-spin" />
                                        <span className="text-xs text-text-secondary/50">
                                            {isSubmitting ? "Running test cases..." : "Executing code..."}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
}
