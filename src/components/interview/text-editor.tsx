"use client";

import { useRef, useEffect } from "react";

interface TextEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export default function TextEditor({
  value,
  onChange,
  readOnly = false,
}: TextEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize on value change
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="h-full w-full overflow-y-auto bg-[#1e1e1e]">
      <textarea
        ref={ref}
        value={value}
        readOnly={readOnly}
        onChange={(e) => {
          onChange?.(e.target.value);
          // resize inline too
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }}
        placeholder="Write your system design answer here... Use markdown formatting."
        className="w-full min-h-full bg-transparent text-foreground font-mono text-sm leading-relaxed resize-none outline-none p-4 placeholder:text-muted-foreground/40"
        spellCheck={false}
      />
    </div>
  );
}
