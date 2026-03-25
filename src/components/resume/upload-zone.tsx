"use client";

import { useCallback, useState } from "react";
import { UploadCloud, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileRead: (text: string, file: File) => void;
  className?: string;
}

const ACCEPTED = [".pdf", ".docx", ".txt"];
const ACCEPTED_MIME = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function extractText(file: File): Promise<string> {
  // For .txt files use FileReader directly
  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string ?? "");
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // For PDF and DOCX: read as data URL and extract what we can via text
  // The server-side API will handle binary parsing; we pass the raw text
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string ?? "";
      // Strip binary noise — keep only printable ASCII/UTF-8 chars
      const cleaned = result.replace(/[^\x20-\x7E\n\r\t\u00A0-\uFFFF]/g, " ").replace(/\s{3,}/g, "\n");
      resolve(cleaned.slice(0, 20000));
    };
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });
}

export default function UploadZone({ onFileRead, className }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext) && !ACCEPTED_MIME.includes(file.type)) {
      setError("Only .pdf, .docx, and .txt files are supported.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large (${formatBytes(file.size)}). Maximum size is 5 MB.`);
      return;
    }
    setProcessing(true);
    try {
      const text = await extractText(file);
      setUploadedFile(file);
      onFileRead(text, file);
    } catch {
      setError("Failed to read file. Please try a .txt version.");
    } finally {
      setProcessing(false);
    }
  }, [onFileRead]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clear = () => {
    setUploadedFile(null);
    setError(null);
  };

  if (uploadedFile) {
    return (
      <div className={cn("flex items-center gap-3 glass rounded-xl px-4 py-3 border border-emerald-500/30 bg-emerald-500/5", className)}>
        <File className="w-5 h-5 text-emerald-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(uploadedFile.size)}</p>
        </div>
        <button onClick={clear} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10 px-6 text-center",
          dragging
            ? "border-blue-500/60 bg-blue-500/8"
            : "border-white/15 bg-white/2 hover:border-white/25 hover:bg-white/4",
          processing && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          onChange={onInputChange}
        />
        <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
          <UploadCloud className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {processing ? "Reading file…" : "Drop your resume here"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse · PDF, DOCX, TXT
          </p>
        </div>
      </label>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
