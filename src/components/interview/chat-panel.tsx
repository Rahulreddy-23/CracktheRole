"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

const INITIAL_MESSAGE: ChatMessage = {
  id: "init",
  role: "assistant",
  content:
    "Hi! I'm your AI interviewer. I've presented you with a problem. Feel free to start coding and ask me any questions about the problem. I'll guide you through the interview process.",
  timestamp: new Date(),
};

interface ChatPanelProps {
  sessionId: string;
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
  code: string;
  problemContext: string;
  interviewType: string;
}

export default function ChatPanel({
  sessionId,
  messages,
  onMessagesChange,
  code,
  problemContext,
  interviewType,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Always show the initial greeting, then real messages on top
  const allMessages = [INITIAL_MESSAGE, ...messages];

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, isTyping]);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineH = 20; // ~20px per line
    const maxH = lineH * 3 + 16; // 3 lines + padding
    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    // Real messages (no display-only initial greeting)
    const updatedMessages = [...messages, userMsg];
    onMessagesChange(updatedMessages);
    setIsTyping(true);

    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text,
          code,
          // Only real user/assistant turns — Claude API requires starting with user role
          conversationHistory: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          problemContext,
          interviewType,
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const data = (await res.json()) as { reply: string };
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      onMessagesChange([...updatedMessages, assistantMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I had trouble responding. Please try again.",
        timestamp: new Date(),
      };
      onMessagesChange([...updatedMessages, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {allMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white/6 border border-white/10 text-foreground rounded-bl-sm"
              )}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-black/30 [&_pre]:p-2 [&_pre]:rounded">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/6 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-white/10 bg-background/50">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or describe your approach…"
            rows={1}
            className="flex-1 bg-white/6 border border-white/10 rounded-xl px-3 py-2 text-sm resize-none outline-none placeholder:text-muted-foreground/50 focus:border-blue-500/50 transition-colors min-h-9.5 max-h-19 overflow-y-auto leading-5"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="h-9.5 w-9.5 shrink-0 rounded-xl"
          >
            <SendHorizontal className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/40 mt-1.5 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
