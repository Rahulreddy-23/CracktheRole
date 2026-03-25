"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGE_CONFIG, type SupportedLanguage } from "@/types";

// Lazy-load Monaco — it's ~2MB and must never run on the server
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false }
);

interface CodeEditorProps {
  language: string; // monacoId
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  selectedLanguage?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
}

const LANGUAGES = Object.entries(LANGUAGE_CONFIG) as [
  SupportedLanguage,
  (typeof LANGUAGE_CONFIG)[SupportedLanguage]
][];

// Tab size: 2 for JS/TS, 4 for everything else
function tabSize(monacoId: string): number {
  return ["javascript", "typescript"].includes(monacoId) ? 2 : 4;
}

export default React.memo(function CodeEditor({
  language,
  value,
  onChange,
  readOnly = false,
  selectedLanguage,
  onLanguageChange,
}: CodeEditorProps) {
  return (
    <div className="relative h-full w-full">
      {/* Language selector */}
      {onLanguageChange && selectedLanguage && (
        <div className="absolute top-2 right-2 z-10">
          <Select
            value={selectedLanguage}
            onValueChange={(v) => onLanguageChange(v as SupportedLanguage)}
          >
            <SelectTrigger className="h-7 text-xs bg-background/80 border-white/20 backdrop-blur-sm w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(([key, cfg]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  <span className="flex items-center gap-1.5">
                    {cfg.name}
                    {key === "sql" && (
                      <span className="text-[10px] px-1 py-0 rounded bg-amber-500/20 text-amber-400 leading-tight">
                        Browser
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedLanguage === "sql" && (
            <p className="mt-1 text-[10px] text-amber-400/80 text-right pr-0.5">
              SQL runs locally in your browser
            </p>
          )}
        </div>
      )}

      <MonacoEditor
        height="100%"
        language={language}
        value={value}
        theme="vs-dark"
        onChange={(v) => onChange?.(v ?? "")}
        loading={<EditorSkeleton />}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-mono), JetBrains Mono, monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
          tabSize: tabSize(language),
          wordWrap: "on",
          scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
          overviewRulerLanes: 0,
          renderLineHighlight: "gutter",
          contextmenu: false,
        }}
      />
    </div>
  );
});

function EditorSkeleton() {
  return (
    <div className="h-full w-full bg-[#1e1e1e] p-4 space-y-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 bg-white/5"
          style={{ width: `${30 + Math.random() * 50}%` }}
        />
      ))}
    </div>
  );
}
