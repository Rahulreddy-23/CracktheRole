"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
import { ChevronLeft, Code2, MessageSquare, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import FeedbackView from "@/components/interview/feedback-view";
import PageHeader from "@/components/shared/page-header";
import { useAuth } from "@/hooks/use-auth";
import { getInterviewSession } from "@/lib/db";
import { LANGUAGE_CONFIG } from "@/types";
import type { InterviewSession, ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

// Monaco read-only view — lazy loaded, no SSR
const CodeEditor = dynamic(
  () => import("@/components/interview/code-editor"),
  { ssr: false }
);

// ── Firestore timestamp compat ────────────────────────────────────────────────

type FSDate = Date | { toDate?: () => Date; seconds?: number };

function formatDate(v: FSDate | undefined): string {
  if (!v) return "—";
  let d: Date;
  if (v instanceof Date) d = v;
  else if (typeof (v as { toDate?: () => Date }).toDate === "function")
    d = (v as { toDate: () => Date }).toDate();
  else if (typeof (v as { seconds?: number }).seconds === "number")
    d = new Date((v as { seconds: number }).seconds * 1000);
  else return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type FullSession = Omit<InterviewSession, "startedAt" | "completedAt"> & {
  startedAt: FSDate;
  completedAt?: FSDate;
};

// ── Chat message bubble ───────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-white/6 border border-white/10 text-foreground rounded-bl-sm"
        )}
      >
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId ?? "";
  const router = useRouter();
  const { user } = useAuth();

  const [session, setSession] = useState<FullSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId || !user) return;

    getInterviewSession(sessionId)
      .then((s) => {
        if (!s || s.userId !== user.uid) {
          router.replace("/history");
          return;
        }
        setSession(s as unknown as FullSession);
      })
      .catch(() => router.replace("/history"))
      .finally(() => setLoading(false));
  }, [sessionId, user, router]);

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <>
        <PageHeader title="Interview Results" description="Loading your evaluation…" />
        <div className="max-w-3xl space-y-6">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </>
    );
  }

  // ── No feedback ───────────────────────────────────────────────────────────

  if (!session?.feedback) {
    return (
      <>
        <PageHeader title="Interview Results" />
        <div className="max-w-md glass rounded-2xl border border-white/10 p-8 text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            This interview hasn&apos;t been submitted for evaluation yet.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/interview/${sessionId}`}>Resume Interview</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/interview">New Interview</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const monacoId =
    LANGUAGE_CONFIG[session.language as keyof typeof LANGUAGE_CONFIG]
      ?.monacoId ?? "plaintext";

  const hasCode = !!session.code?.trim();
  const hasMessages = session.messages && session.messages.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Back link */}
      <div className="-mt-2 mb-6">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Interview History
        </Link>
      </div>

      <PageHeader
        title="Interview Results"
        description={`${session.problem.title} · ${session.type} · ${formatDate(session.completedAt ?? session.startedAt)}`}
      />

      {/* ── Main feedback view ── */}
      <FeedbackView
        feedback={session.feedback}
        problem={session.problem}
        type={session.type}
        sessionId={sessionId}
      />

      {/* ── Problem detail (collapsible) ── */}
      <div className="max-w-3xl mt-2">
        <Accordion type="single" collapsible>
          <AccordionItem
            value="problem"
            className="glass rounded-xl border border-white/10 px-5 not-last:border-b-0"
          >
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4 gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-muted-foreground" />
                Problem Description
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold">{session.problem.title}</h2>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize text-xs",
                      session.problem.difficulty === "easy"
                        ? "border-emerald-500/30 text-emerald-400"
                        : session.problem.difficulty === "medium"
                        ? "border-yellow-500/30 text-yellow-400"
                        : "border-red-500/30 text-red-400"
                    )}
                  >
                    {session.problem.difficulty}
                  </Badge>
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-foreground/80">
                  <ReactMarkdown>{session.problem.description}</ReactMarkdown>
                </div>
                {session.problem.examples.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Examples
                    </p>
                    {session.problem.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-white/10 bg-white/3 p-3 font-mono text-xs space-y-1"
                      >
                        <p>
                          <span className="text-muted-foreground">Input: </span>
                          {ex.input}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Output: </span>
                          {ex.output}
                        </p>
                        {ex.explanation && (
                          <p className="text-muted-foreground text-[11px] pt-0.5">
                            {ex.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* ── Final code (collapsible, coding only) ── */}
      {session.type === "coding" && hasCode && (
        <div className="max-w-3xl mt-3">
          <Accordion type="single" collapsible>
            <AccordionItem
              value="code"
              className="glass rounded-xl border border-white/10 px-5 not-last:border-b-0 overflow-hidden"
            >
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4 gap-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  Final Code
                  <Badge
                    variant="outline"
                    className="text-[10px] border-white/10 text-muted-foreground ml-1"
                  >
                    {LANGUAGE_CONFIG[session.language as keyof typeof LANGUAGE_CONFIG]
                      ?.name ?? session.language}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                {/* Read-only Monaco, fixed height */}
                <div className="h-80 -mx-5 border-t border-white/10">
                  <CodeEditor
                    language={monacoId}
                    value={session.code}
                    readOnly
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* ── Non-coding answer (collapsible) ── */}
      {session.type !== "coding" && hasCode && (
        <div className="max-w-3xl mt-3">
          <Accordion type="single" collapsible>
            <AccordionItem
              value="answer"
              className="glass rounded-xl border border-white/10 px-5 not-last:border-b-0"
            >
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4 gap-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  Submitted Answer
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <pre className="font-mono text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap wrap-break-word">
                  {session.code}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* ── Chat transcript (collapsible) ── */}
      {hasMessages && (
        <div className="max-w-3xl mt-3 mb-8">
          <Accordion type="single" collapsible>
            <AccordionItem
              value="chat"
              className="glass rounded-xl border border-white/10 px-5 not-last:border-b-0"
            >
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4 gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  Chat Transcript
                  <span className="text-xs text-muted-foreground font-normal">
                    ({session.messages.length} messages)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {session.messages.map((msg, i) => (
                    <ChatBubble key={msg.id ?? i} msg={msg} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </>
  );
}
