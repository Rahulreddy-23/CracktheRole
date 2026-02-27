"use client";

import { useInterviewStore } from "@/stores/interview-store";
import type { InterviewMessage } from "@/types/interview";
import toast from "react-hot-toast";

export function useInterview() {
  const store = useInterviewStore();

  async function sendMessage(userMessage: string) {
    if (!store.config || store.isLoading) return;

    const message: InterviewMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    store.addMessage(message);
    store.setLoading(true);

    try {
      const response = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: store.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt: buildSystemPrompt(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: InterviewMessage = {
        role: "assistant",
        content: data.message.text,
        timestamp: new Date(),
      };

      store.addMessage(assistantMessage);
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      store.setLoading(false);
    }
  }

  async function scoreInterview() {
    if (!store.config || store.messages.length === 0) return;

    store.setLoading(true);

    try {
      const transcript = store.messages
        .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
        .join("\n\n");

      const response = await fetch("/api/interview/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          jobRole: store.config.jobRole,
          difficulty: store.config.difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to score interview");
      }

      const scoreData = await response.json();
      store.setScore(scoreData);
    } catch {
      toast.error("Failed to generate score. Please try again.");
    } finally {
      store.setLoading(false);
    }
  }

  function buildSystemPrompt(): string {
    if (!store.config) return "";

    return `You are an experienced technical interviewer conducting a ${store.config.interviewType} interview for a ${store.config.jobRole} position at the ${store.config.difficulty} level${store.config.targetCompany ? ` at ${store.config.targetCompany}` : ""}.

Conduct a realistic and challenging interview. Ask one question at a time. Listen carefully to responses and ask relevant follow-up questions. Be professional but approachable. Provide brief acknowledgments before moving to the next question.

Keep responses concise and focused on the interview context.`;
  }

  return {
    ...store,
    sendMessage,
    scoreInterview,
  };
}
