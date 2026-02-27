"use client";

import { useRef, useEffect, useState, useCallback, type KeyboardEvent } from "react";
import { Send, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/interview/ChatMessage";
import { useInterviewStore } from "@/stores/interview-store";
import type { ChatMessage as ChatMessageType, InterviewType } from "@/types/interview";

interface ChatInterfaceProps {
    interviewType: InterviewType;
}

function buildSystemPrompt(
    type: InterviewType,
    difficulty: string,
    company: string
): string {
    const companyLabel = company || "a top tech company";

    const prompts: Record<string, string> = {
        dsa: `You are a senior software engineer conducting a technical DSA interview at ${companyLabel}. Ask one algorithmic problem appropriate for ${difficulty} level. After the candidate responds, ask follow-up questions about time/space complexity, edge cases, and optimizations. Be professional but challenging. If the candidate is stuck, give small hints. At the end, evaluate their approach. Format code examples in markdown code blocks.`,

        system_design: `You are a senior architect conducting a system design interview at ${companyLabel}. Present a system design problem appropriate for ${difficulty} level. Guide the candidate through requirements gathering, high-level design, component details, and scaling considerations. Ask probing questions about trade-offs. Use markdown formatting for diagrams and lists.`,

        behavioral: `You are an HR manager conducting a behavioral interview at ${companyLabel}. Ask STAR-format behavioral questions about leadership, conflict resolution, failure, and ambition. Follow up on each answer with probing questions. Be warm but thorough. Ask one question at a time and wait for the candidate to respond before asking the next.`,

        sql: `You are a data engineering interviewer at ${companyLabel}. Present SQL problems appropriate for ${difficulty} level involving JOINs, window functions, CTEs, aggregations, and query optimization. Ask the candidate to write queries and explain their approach. Format SQL examples in markdown code blocks with sql syntax highlighting.`,
    };

    return prompts[type] || prompts.dsa;
}

export default function ChatInterface({ interviewType }: ChatInterfaceProps) {
    const messages = useInterviewStore((s) => s.messages);
    const isStreaming = useInterviewStore((s) => s.isStreaming);
    const streamingContent = useInterviewStore((s) => s.streamingContent);
    const sessionId = useInterviewStore((s) => s.sessionId);
    const config = useInterviewStore((s) => s.config);
    const editorCode = useInterviewStore((s) => s.editorCode);
    const editorLanguage = useInterviewStore((s) => s.editorLanguage);
    const addMessage = useInterviewStore((s) => s.addMessage);
    const setStreaming = useInterviewStore((s) => s.setStreaming);
    const appendStreamingContent = useInterviewStore((s) => s.appendStreamingContent);
    const finalizeStreamingMessage = useInterviewStore((s) => s.finalizeStreamingMessage);
    const clearStreamingContent = useInterviewStore((s) => s.clearStreamingContent);

    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const hasInitialized = useRef(false);

    const showCodeButton = interviewType === "dsa" || interviewType === "sql";

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingContent]);

    // Send a message to the AI and stream the response
    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isStreaming || !config) return;

            const userMessage: ChatMessageType = {
                id: `user-${Date.now()}`,
                role: "user",
                content: content.trim(),
                timestamp: Date.now(),
            };

            addMessage(userMessage);
            setInputValue("");
            setStreaming(true);
            clearStreamingContent();

            // Build conversation history for API
            const conversationHistory = [
                ...messages.map((m) => ({
                    role: m.role as "user" | "assistant",
                    content: m.content,
                })),
                { role: "user" as const, content: content.trim() },
            ];

            const systemPrompt = buildSystemPrompt(
                config.interviewType,
                config.difficulty,
                config.companyContext ?? ""
            );

            try {
                const response = await fetch("/api/interview/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId,
                        messages: conversationHistory,
                        systemPrompt,
                        interviewType: config.interviewType,
                        difficulty: config.difficulty,
                        companyContext: config.companyContext,
                    }),
                });

                if (!response.ok || !response.body) {
                    throw new Error("Stream failed");
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    appendStreamingContent(chunk);
                }

                finalizeStreamingMessage();
            } catch (err) {
                console.error("Chat error:", err);
                const errorMessage: ChatMessageType = {
                    id: `error-${Date.now()}`,
                    role: "assistant",
                    content:
                        "The interviewer is having a brief moment. Please try again.",
                    timestamp: Date.now(),
                };
                addMessage(errorMessage);
                setStreaming(false);
                clearStreamingContent();
            }
        },
        [
            isStreaming,
            config,
            messages,
            sessionId,
            addMessage,
            setStreaming,
            clearStreamingContent,
            appendStreamingContent,
            finalizeStreamingMessage,
        ]
    );

    // Trigger the initial AI greeting on mount
    useEffect(() => {
        if (hasInitialized.current || messages.length > 0) return;
        hasInitialized.current = true;

        async function fetchGreeting() {
            if (!config) return;
            setStreaming(true);
            clearStreamingContent();

            const systemPrompt = buildSystemPrompt(
                config.interviewType,
                config.difficulty,
                config.companyContext ?? ""
            );

            try {
                const response = await fetch("/api/interview/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId,
                        messages: [
                            {
                                role: "user",
                                content:
                                    "Hello, I am ready for the interview. Please begin.",
                            },
                        ],
                        systemPrompt,
                        interviewType: config.interviewType,
                        difficulty: config.difficulty,
                        companyContext: config.companyContext,
                    }),
                });

                if (!response.ok || !response.body) throw new Error("Stream failed");

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    appendStreamingContent(decoder.decode(value, { stream: true }));
                }

                finalizeStreamingMessage();
            } catch (err) {
                console.error("Greeting error:", err);
                setStreaming(false);
                clearStreamingContent();
                const greetingError: ChatMessageType = {
                    id: `error-${Date.now()}`,
                    role: "assistant",
                    content:
                        "The interviewer is having a brief moment. Please try again by typing a message.",
                    timestamp: Date.now(),
                };
                addMessage(greetingError);
            }
        }

        fetchGreeting();
    }, [config, sessionId, messages.length, setStreaming, clearStreamingContent, appendStreamingContent, finalizeStreamingMessage, addMessage]);

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputValue);
        }
    }

    function handleSubmitCode() {
        if (!editorCode.trim()) return;
        const codeMessage = `Here is my code (${editorLanguage}):\n\n\`\`\`${editorLanguage}\n${editorCode}\n\`\`\``;
        sendMessage(codeMessage);
    }

    // Auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }, [inputValue]);

    return (
        <div className="flex flex-col h-full">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
                ))}

                {/* Streaming message */}
                {isStreaming && streamingContent && (
                    <ChatMessage
                        role="assistant"
                        content={streamingContent}
                        isStreaming
                    />
                )}

                {/* Loading indicator when streaming but no content yet */}
                {isStreaming && !streamingContent && (
                    <div className="flex items-center gap-2 text-text-secondary/50 text-sm px-11">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                        <span>Interviewer is thinking...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-border/40 px-4 py-3 bg-surface/50">
                <div className="flex items-end gap-2">
                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your response... (Enter to send, Shift+Enter for new line)"
                        disabled={isStreaming}
                        rows={1}
                        className="flex-1 resize-none bg-background border border-border/50 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-brand-primary/50 disabled:opacity-50 min-h-[40px] max-h-[120px]"
                    />

                    {showCodeButton && (
                        <Button
                            onClick={handleSubmitCode}
                            disabled={isStreaming || !editorCode.trim()}
                            variant="outline"
                            size="sm"
                            className="h-10 border-border/50 text-text-secondary hover:text-text-primary bg-transparent gap-1.5 shrink-0"
                            title="Submit code from editor"
                        >
                            <Code2 className="w-4 h-4" />
                            <span className="hidden sm:inline text-xs">Submit Code</span>
                        </Button>
                    )}

                    <Button
                        onClick={() => sendMessage(inputValue)}
                        disabled={isStreaming || !inputValue.trim()}
                        className="h-10 w-10 p-0 bg-brand-primary hover:bg-brand-primary/90 text-white shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
