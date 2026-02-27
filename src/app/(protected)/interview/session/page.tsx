"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, PanelRightOpen, PanelRightClose } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/interview/ChatInterface";
import CodeEditorPanel from "@/components/interview/CodeEditorPanel";
import InterviewTimer from "@/components/interview/InterviewTimer";
import EndInterviewDialog from "@/components/interview/EndInterviewDialog";
import { useInterviewStore } from "@/stores/interview-store";

const TYPE_LABELS: Record<string, string> = {
  dsa: "DSA",
  system_design: "System Design",
  behavioral: "Behavioral",
  sql: "SQL",
};

const TYPE_COLORS: Record<string, string> = {
  dsa: "bg-brand-primary/15 text-brand-primary-light border-brand-primary/30",
  system_design: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  behavioral: "bg-brand-success/15 text-brand-success border-brand-success/30",
  sql: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-brand-success/15 text-brand-success border-brand-success/30",
  medium: "bg-brand-warning/15 text-brand-warning border-brand-warning/30",
  hard: "bg-brand-danger/15 text-brand-danger border-brand-danger/30",
};

function InterviewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("id");

  const config = useInterviewStore((s) => s.config);
  const sessionId = useInterviewStore((s) => s.sessionId);
  const setTimerRunning = useInterviewStore((s) => s.setTimerRunning);
  const reset = useInterviewStore((s) => s.reset);

  const [isEditorVisible, setIsEditorVisible] = useState(true);
  const [isScoring, setIsScoring] = useState(false);

  // Start the timer when the component mounts
  useEffect(() => {
    setTimerRunning(true);
    return () => setTimerRunning(false);
  }, [setTimerRunning]);

  // If no config/session in store, redirect back to setup
  useEffect(() => {
    if (!config || !sessionId) {
      if (!sessionIdParam) {
        router.push("/interview/setup");
      }
    }
  }, [config, sessionId, sessionIdParam, router]);

  const handleEndInterview = useCallback(async () => {
    const id = sessionId || sessionIdParam;
    if (!id) return;

    setIsScoring(true);
    setTimerRunning(false);

    try {
      const response = await fetch("/api/interview/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });

      if (!response.ok) throw new Error("Scoring failed");

      const data = await response.json();
      reset();
      router.push(`/interview/review/${data.sessionId || id}`);
    } catch (err) {
      console.error("Scoring error:", err);
      setIsScoring(false);
    }
  }, [sessionId, sessionIdParam, setTimerRunning, reset, router]);

  // Show loading screen while scoring
  if (isScoring) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-brand-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Generating your scorecard...
          </h2>
          <p className="text-sm text-text-secondary">
            The AI is reviewing your interview performance
          </p>
        </motion.div>
      </main>
    );
  }

  // If no config yet, show a loading state
  if (!config) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
      </main>
    );
  }

  const interviewType = config.interviewType;

  return (
    <main className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-surface/50 shrink-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] ${TYPE_COLORS[interviewType] || ""}`}
          >
            {TYPE_LABELS[interviewType] || interviewType}
          </Badge>
          <Badge
            variant="outline"
            className={`text-[10px] ${DIFFICULTY_COLORS[config.difficulty] || ""}`}
          >
            {config.difficulty}
          </Badge>
          {config.companyContext && (
            <span className="text-xs text-text-secondary/60">
              {config.companyContext}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <InterviewTimer />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditorVisible(!isEditorVisible)}
            className="text-text-secondary hover:text-text-primary h-7 w-7 p-0 lg:hidden"
            title="Toggle editor panel"
          >
            {isEditorVisible ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </Button>

          <EndInterviewDialog onConfirm={handleEndInterview} />
        </div>
      </div>

      {/* Split panel layout */}
      <div className="flex-1 flex min-h-0">
        {/* Chat panel (left, wider) */}
        <div
          className={`flex flex-col min-h-0 ${isEditorVisible ? "w-full lg:w-[60%]" : "w-full"
            }`}
        >
          <ChatInterface interviewType={interviewType} />
        </div>

        {/* Editor/Notes panel (right, narrower) */}
        <AnimatePresence>
          {isEditorVisible && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "40%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="hidden lg:flex min-h-0"
            >
              <div className="flex-1 min-h-0">
                <CodeEditorPanel interviewType={interviewType} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function InterviewSessionPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
        </main>
      }
    >
      <InterviewSessionContent />
    </Suspense>
  );
}
