"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import {
    Copy,
    RotateCcw,
    Check,
    ChevronDown,
    FileCode2,
    Terminal,
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
import type { InterviewType } from "@/types/interview";
import type { editor } from "monaco-editor";

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

    const [copied, setCopied] = useState(false);
    const [cursorLine, setCursorLine] = useState(1);
    const [cursorCol, setCursorCol] = useState(1);

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
            // Only set default code if editor is empty or has default code
            const currentDefault = DEFAULT_CODE[editorLanguage] || "";
            if (!editorCode || editorCode === currentDefault) {
                setEditorCode(DEFAULT_CODE[lang] || "");
            }
        },
        [editorCode, editorLanguage, setEditorCode, setEditorLanguage]
    );

    const handleEditorMount = useCallback(
        (editorInstance: editor.IStandaloneCodeEditor) => {
            editorInstance.onDidChangeCursorPosition((e) => {
                setCursorLine(e.position.lineNumber);
                setCursorCol(e.position.column);
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
            {/* Enhanced toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40 bg-surface/80">
                <div className="flex items-center gap-2">
                    <FileCode2 className="w-3.5 h-3.5 text-text-secondary/60" />
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                        Editor
                    </span>
                    <div className="w-px h-4 bg-border/40 mx-1" />
                    <Select value={editorLanguage} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-[120px] h-7 text-xs bg-background/50 border-border/40 text-text-secondary gap-1">
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

            {/* Monaco editor */}
            <div className="flex-1 min-h-0">
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
