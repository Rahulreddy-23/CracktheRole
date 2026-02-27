"use client";

import dynamic from "next/dynamic";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useInterviewStore } from "@/stores/interview-store";
import type { InterviewType } from "@/types/interview";

// Lazy-load Monaco to avoid SSR issues and reduce initial bundle
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGES = [
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "sql", label: "SQL" },
];

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

    const showCodeEditor =
        interviewType === "dsa" || interviewType === "sql";

    if (!showCodeEditor) {
        // Notes textarea for behavioral and system design
        return (
            <div className="flex flex-col h-full bg-surface border-l border-border/40">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                        Notes
                    </span>
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

    return (
        <div className="flex flex-col h-full bg-surface border-l border-border/40">
            {/* Language selector header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    Code Editor
                </span>
                <Select value={editorLanguage} onValueChange={setEditorLanguage}>
                    <SelectTrigger className="w-28 h-7 text-xs bg-transparent border-border/50 text-text-secondary">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border/50">
                        {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value} className="text-xs">
                                {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Monaco editor */}
            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    language={editorLanguage}
                    theme="vs-dark"
                    value={editorCode}
                    onChange={(value) => setEditorCode(value ?? "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbersMinChars: 3,
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        padding: { top: 12 },
                        renderLineHighlight: "none",
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                        scrollbar: {
                            verticalScrollbarSize: 6,
                            horizontalScrollbarSize: 6,
                        },
                    }}
                />
            </div>
        </div>
    );
}
