"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useRef, useEffect } from "react";
import {
    Copy,
    RotateCcw,
    Check,
    ChevronDown,
    ChevronUp,
    FileCode2,
    Terminal,
    Play,
    Loader2,
    Sparkles,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useInterviewStore } from "@/stores/interview-store";
import type { InterviewType, ChatMessage } from "@/types/interview";
import type { editor } from "monaco-editor";
import type { Monaco } from "@monaco-editor/react";
import toast from "react-hot-toast";

// Lazy-load Monaco to avoid SSR issues and reduce initial bundle
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGES = [
    { value: "python", label: "Python", icon: "Py" },
    { value: "javascript", label: "JavaScript", icon: "JS" },
    { value: "typescript", label: "TypeScript", icon: "TS" },
    { value: "java", label: "Java", icon: "Jv" },
    { value: "cpp", label: "C++", icon: "C+" },
    { value: "go", label: "Go", icon: "Go" },
    { value: "rust", label: "Rust", icon: "Rs" },
    { value: "sql", label: "SQL", icon: "SQ" },
];

const DEFAULT_CODE: Record<string, string> = {
    python: '# Write your solution here\n\ndef solution():\n    pass\n',
    javascript: '// Write your solution here\n\nfunction solution() {\n  \n}\n',
    typescript: '// Write your solution here\n\nfunction solution(): void {\n  \n}\n',
    java: '// Write your solution here\n\nclass Solution {\n    public void solve() {\n        \n    }\n}\n',
    cpp: '// Write your solution here\n\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
    go: '// Write your solution here\n\npackage main\n\nfunc main() {\n\t\n}\n',
    rust: '// Write your solution here\n\nfn main() {\n    \n}\n',
    sql: '-- Write your query here\n\nSELECT *\nFROM table_name\nWHERE 1=1;\n',
};

// Shape we need from a Monaco selection for our operations
interface SelectionRange {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
}

function parseErrorLines(stderr: string, language: string): number[] {
    if (!stderr) return [];
    const lines: number[] = [];
    let matches: RegExpExecArray | null;

    switch (language) {
        case "python": {
            const re = /(?:line (\d+)|File .+, line (\d+))/g;
            while ((matches = re.exec(stderr)) !== null) {
                const n = parseInt(matches[1] ?? matches[2], 10);
                if (!isNaN(n)) lines.push(n);
            }
            break;
        }
        case "javascript":
        case "typescript": {
            const re = /:(\d+):\d+/g;
            while ((matches = re.exec(stderr)) !== null) {
                const n = parseInt(matches[1], 10);
                if (!isNaN(n)) lines.push(n);
            }
            break;
        }
        case "java": {
            const re = /\.java:(\d+)/g;
            while ((matches = re.exec(stderr)) !== null) {
                const n = parseInt(matches[1], 10);
                if (!isNaN(n)) lines.push(n);
            }
            break;
        }
        case "cpp": {
            const re = /:(\d+):\d+: error/g;
            while ((matches = re.exec(stderr)) !== null) {
                const n = parseInt(matches[1], 10);
                if (!isNaN(n)) lines.push(n);
            }
            break;
        }
        case "go": {
            const re = /\.go:(\d+):\d+/g;
            while ((matches = re.exec(stderr)) !== null) {
                const n = parseInt(matches[1], 10);
                if (!isNaN(n)) lines.push(n);
            }
            break;
        }
        case "rust": {
            const re = /--> .+:(\d+):\d+/g;
            while ((matches = re.exec(stderr)) !== null) {
                const n = parseInt(matches[1], 10);
                if (!isNaN(n)) lines.push(n);
            }
            break;
        }
    }

    return [...new Set(lines)];
}

interface CodeEditorPanelProps {
    interviewType: InterviewType;
}

export default function CodeEditorPanel({
    interviewType,
}: CodeEditorPanelProps) {
    const editorCode = useInterviewStore((s) => s.editorCode);
    const editorLanguage = useInterviewStore((s) => s.editorLanguage);
    const setEditorCode = useInterviewStore((s) => s.setEditorCode);
    const setEditorLanguage = useInterviewStore((s) => s.setEditorLanguage);
    const executionOutput = useInterviewStore((s) => s.executionOutput);
    const executionError = useInterviewStore((s) => s.executionError);
    const executionTime = useInterviewStore((s) => s.executionTime);
    const isExecuting = useInterviewStore((s) => s.isExecuting);
    const clearExecution = useInterviewStore((s) => s.clearExecution);

    const [copied, setCopied] = useState(false);
    const [cursorLine, setCursorLine] = useState(1);
    const [cursorCol, setCursorCol] = useState(1);
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);

    // Refs for editor/monaco instances — avoids re-render churn
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const askAiButtonRef = useRef<HTMLButtonElement | null>(null);
    const currentSelectionRef = useRef<SelectionRange | null>(null);
    // Keeps Monaco's addCommand always pointing at the latest handleRunCode
    const handleRunCodeRef = useRef<(() => Promise<void>) | null>(null);

    const showCodeEditor =
        interviewType === "dsa" || interviewType === "sql";

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(editorCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard may not be available
        }
    }, [editorCode]);

    const handleReset = useCallback(() => {
        const defaultCode = DEFAULT_CODE[editorLanguage] || "";
        setEditorCode(defaultCode);
    }, [editorLanguage, setEditorCode]);

    const handleLanguageChange = useCallback(
        (lang: string) => {
            setEditorLanguage(lang);
            const currentDefault = DEFAULT_CODE[editorLanguage] || "";
            if (!editorCode || editorCode === currentDefault) {
                setEditorCode(DEFAULT_CODE[lang] || "");
            }
        },
        [editorCode, editorLanguage, setEditorCode, setEditorLanguage]
    );

    // Read store state via getState() inside the callback to avoid stale closures.
    // This function is stable (empty deps) so Monaco's addCommand always works correctly.
    const handleRunCode = useCallback(async () => {
        const state = useInterviewStore.getState();
        if (!state.editorCode || state.isExecuting) return;

        const { editorCode: code, editorLanguage: lang } = state;

        state.setExecuting(true);

        // Clear previous markers before execution
        if (monacoRef.current && editorRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
                monacoRef.current.editor.setModelMarkers(
                    model,
                    "execution-errors",
                    []
                );
            }
        }

        try {
            const res = await fetch("/api/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language: lang, code }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Execution failed");
                state.setExecutionResult("", data.error || "Execution failed", 0);
                setIsConsoleOpen(true);
                return;
            }

            state.setExecutionResult(data.stdout, data.stderr, data.executionTime);
            setIsConsoleOpen(true);

            // Place error markers if stderr contains parseable line references
            if (data.stderr && monacoRef.current && editorRef.current) {
                const model = editorRef.current.getModel();
                if (model) {
                    const errorLines = parseErrorLines(data.stderr, lang);
                    if (errorLines.length > 0) {
                        const markers = errorLines.map((line) => ({
                            startLineNumber: line,
                            startColumn: 1,
                            endLineNumber: line,
                            endColumn: model.getLineMaxColumn(line),
                            message: data.stderr as string,
                            severity: monacoRef.current!.MarkerSeverity.Error,
                        }));
                        monacoRef.current.editor.setModelMarkers(
                            model,
                            "execution-errors",
                            markers
                        );
                    }
                }
            }
        } catch {
            toast.error("Failed to execute code. Please try again.");
        } finally {
            useInterviewStore.getState().setExecuting(false);
        }
    }, []);

    // Keep the ref current so Monaco's registered command always invokes the latest version
    useEffect(() => {
        handleRunCodeRef.current = handleRunCode;
    }, [handleRunCode]);

    // Send highlighted code to the AI chat panel without causing re-renders on selection change.
    // All state is read via refs or getState().
    const handleAskAi = useCallback(() => {
        if (!currentSelectionRef.current || !editorRef.current) return;

        const model = editorRef.current.getModel();
        if (!model) return;

        const selectedCode = model.getValueInRange(currentSelectionRef.current);
        if (!selectedCode.trim()) return;

        const { editorLanguage: lang, addMessage } = useInterviewStore.getState();

        const message: ChatMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content: `I need help with this specific part of my code:\n\n\`\`\`${lang}\n${selectedCode}\n\`\`\`\n\nCan you explain what this does, find any bugs, or suggest improvements?`,
            timestamp: Date.now(),
        };

        addMessage(message);

        // Collapse the selection to remove the highlight
        const sel = currentSelectionRef.current;
        editorRef.current.setSelection({
            startLineNumber: sel.startLineNumber,
            startColumn: sel.startColumn,
            endLineNumber: sel.startLineNumber,
            endColumn: sel.startColumn,
        });

        currentSelectionRef.current = null;
        if (askAiButtonRef.current) {
            askAiButtonRef.current.style.display = "none";
        }

        toast.success("Sent to AI interviewer");
    }, []);

    const handleEditorMount = useCallback(
        (editorInstance: editor.IStandaloneCodeEditor, monacoInstance: Monaco) => {
            editorRef.current = editorInstance;
            monacoRef.current = monacoInstance;

            // Cursor position tracking
            editorInstance.onDidChangeCursorPosition((e) => {
                setCursorLine(e.position.lineNumber);
                setCursorCol(e.position.column);
            });

            // Clear error markers whenever the user edits code
            editorInstance.onDidChangeModelContent(() => {
                const model = editorInstance.getModel();
                if (model) {
                    monacoInstance.editor.setModelMarkers(
                        model,
                        "execution-errors",
                        []
                    );
                }
            });

            // Cmd+Enter / Ctrl+Enter to run code
            editorInstance.addCommand(
                monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
                () => {
                    handleRunCodeRef.current?.();
                }
            );

            // Ask AI on text selection — direct DOM manipulation avoids re-renders on every cursor move
            editorInstance.onDidChangeCursorSelection((e) => {
                const sel = e.selection;
                const isEmpty =
                    sel.startLineNumber === sel.endLineNumber &&
                    sel.startColumn === sel.endColumn;

                if (isEmpty) {
                    currentSelectionRef.current = null;
                    if (askAiButtonRef.current) {
                        askAiButtonRef.current.style.display = "none";
                    }
                    return;
                }

                currentSelectionRef.current = {
                    startLineNumber: sel.startLineNumber,
                    startColumn: sel.startColumn,
                    endLineNumber: sel.endLineNumber,
                    endColumn: sel.endColumn,
                };

                const endPos = editorInstance.getScrolledVisiblePosition({
                    lineNumber: sel.endLineNumber,
                    column: sel.endColumn,
                });

                if (endPos && askAiButtonRef.current && editorContainerRef.current) {
                    const containerWidth = editorContainerRef.current.offsetWidth;
                    // Keep button within container bounds (approximate button width: 88px)
                    const left = Math.min(endPos.left, containerWidth - 96);
                    askAiButtonRef.current.style.display = "flex";
                    askAiButtonRef.current.style.top = `${endPos.top + 4}px`;
                    askAiButtonRef.current.style.left = `${Math.max(8, left)}px`;
                }
            });
        },
        []
    );

    if (!showCodeEditor) {
        // Notes textarea for behavioral and system design
        return (
            <div className="flex flex-col h-full bg-surface border-l border-border/40">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-text-secondary/60" />
                        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                            Notes
                        </span>
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-6 w-6 p-0 text-text-secondary/60 hover:text-text-primary"
                                aria-label="Copy notes to clipboard"
                            >
                                {copied ? (
                                    <Check className="w-3.5 h-3.5 text-brand-success" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy to clipboard</TooltipContent>
                    </Tooltip>
                </div>
                <textarea
                    value={editorCode}
                    onChange={(e) => setEditorCode(e.target.value)}
                    placeholder="Use this space to jot down your thoughts, outline your answer, or sketch system components..."
                    className="flex-1 w-full resize-none bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none font-mono"
                />
            </div>
        );
    }

    const currentLang = LANGUAGES.find((l) => l.value === editorLanguage);

    return (
        <div className="flex flex-col h-full bg-surface border-l border-border/40">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40 bg-surface/80">
                <div className="flex items-center gap-2">
                    <FileCode2 className="w-3.5 h-3.5 text-text-secondary/60" />
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                        Editor
                    </span>
                    <div className="w-px h-4 bg-border/40 mx-1" />
                    <Select value={editorLanguage} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-30 h-7 text-xs bg-background/50 border-border/40 text-text-secondary gap-1">
                            {currentLang && (
                                <span className="text-[10px] font-bold text-brand-primary-light bg-brand-primary/15 px-1.5 py-0.5 rounded">
                                    {currentLang.icon}
                                </span>
                            )}
                            <SelectValue />
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface border-border/50">
                            {LANGUAGES.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value} className="text-xs">
                                    <span className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-brand-primary-light bg-brand-primary/15 px-1.5 py-0.5 rounded w-6 text-center">
                                            {lang.icon}
                                        </span>
                                        {lang.label}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                    {/* Run Code — positioned between language selector and copy/reset */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRunCode}
                                disabled={isExecuting || !editorCode}
                                className="h-7 px-2.5 gap-1.5 text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-50"
                                aria-label="Run code"
                            >
                                {isExecuting ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Play className="w-3.5 h-3.5" />
                                )}
                                Run
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Run code (Cmd+Enter)</TooltipContent>
                    </Tooltip>

                    <div className="w-px h-4 bg-border/40 mx-0.5" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="h-7 w-7 p-0 text-text-secondary/60 hover:text-text-primary hover:bg-surface2"
                                aria-label="Reset code to default template"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reset to template</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-7 w-7 p-0 text-text-secondary/60 hover:text-text-primary hover:bg-surface2"
                                aria-label="Copy code to clipboard"
                            >
                                {copied ? (
                                    <Check className="w-3.5 h-3.5 text-brand-success" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{copied ? "Copied" : "Copy code"}</TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {/* Monaco editor — position:relative so the Ask AI button can be absolutely placed */}
            <div className="flex-1 min-h-0 relative" ref={editorContainerRef}>
                <Editor
                    height="100%"
                    language={editorLanguage}
                    theme="vs-dark"
                    value={editorCode}
                    onChange={(value) => setEditorCode(value ?? "")}
                    onMount={handleEditorMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily: "var(--font-geist-mono), 'Fira Code', 'JetBrains Mono', monospace",
                        fontLigatures: true,
                        lineNumbersMinChars: 3,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        padding: { top: 12, bottom: 12 },
                        renderLineHighlight: "line",
                        renderLineHighlightOnlyWhenFocus: true,
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        smoothScrolling: true,
                        bracketPairColorization: { enabled: true },
                        autoClosingBrackets: "always",
                        autoClosingQuotes: "always",
                        autoIndent: "full",
                        formatOnPaste: true,
                        tabSize: 2,
                        detectIndentation: true,
                        suggest: {
                            showKeywords: true,
                            showSnippets: true,
                        },
                        scrollbar: {
                            verticalScrollbarSize: 6,
                            horizontalScrollbarSize: 6,
                            verticalSliderSize: 6,
                            useShadows: false,
                        },
                    }}
                />

                {/* Floating "Ask AI" button — shown via direct DOM manipulation, not useState,
                    so it never causes re-renders on cursor move */}
                <button
                    ref={askAiButtonRef}
                    onClick={handleAskAi}
                    style={{ display: "none", position: "absolute", zIndex: 50 }}
                    className="items-center gap-1 bg-brand-primary/90 text-white text-xs px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm cursor-pointer border-0"
                    aria-label="Ask AI about selected code"
                >
                    <Sparkles className="w-3 h-3" />
                    Ask AI
                </button>
            </div>

            {/* Output console — collapses to a thin header bar when not in use */}
            <div
                className={`border-t border-border/40 flex flex-col bg-background/50 transition-all duration-200 ${
                    isConsoleOpen ? "h-40" : "h-8"
                }`}
            >
                {/* Console header / toggle */}
                <button
                    onClick={() => setIsConsoleOpen((prev) => !prev)}
                    className="flex items-center justify-between px-3 h-8 w-full shrink-0 text-left hover:bg-surface2/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-text-secondary/60" />
                        <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">
                            Console
                        </span>
                        {executionTime !== null && (
                            <span className="text-[10px] text-text-secondary/50">
                                Executed in {executionTime.toFixed(2)}s
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {(executionOutput || executionError) && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearExecution();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.stopPropagation();
                                        clearExecution();
                                    }
                                }}
                                className="text-[10px] text-text-secondary/50 hover:text-text-secondary px-1 py-0.5 rounded hover:bg-surface2/50"
                            >
                                Clear
                            </span>
                        )}
                        {isConsoleOpen ? (
                            <ChevronDown className="w-3 h-3 text-text-secondary/50" />
                        ) : (
                            <ChevronUp className="w-3 h-3 text-text-secondary/50" />
                        )}
                    </div>
                </button>

                {/* Console output body */}
                {isConsoleOpen && (
                    <div className="flex-1 overflow-auto px-3 py-2 font-mono text-xs">
                        {!executionOutput && !executionError ? (
                            <p className="text-text-secondary/40 italic">
                                Run your code to see output here.
                            </p>
                        ) : (
                            <>
                                {executionOutput && (
                                    <pre className="text-text-primary whitespace-pre-wrap break-all">
                                        {executionOutput}
                                    </pre>
                                )}
                                {executionError && (
                                    <pre className="text-red-400 whitespace-pre-wrap break-all mt-1">
                                        {executionError}
                                    </pre>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-3 py-1 border-t border-border/40 bg-background/50 text-[10px] text-text-secondary/50 font-mono">
                <div className="flex items-center gap-3">
                    <span>
                        Ln {cursorLine}, Col {cursorCol}
                    </span>
                    <span>{editorLanguage}</span>
                </div>
                <span>UTF-8</span>
            </div>
        </div>
    );
}
