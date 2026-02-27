"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
    isStreaming?: boolean;
}

function ChatMessage({
    role,
    content,
    isStreaming = false,
}: ChatMessageProps) {
    const isAI = role === "assistant";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"}`}
        >
            {isAI && (
                <div className="w-8 h-8 rounded-lg bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-brand-primary-light" />
                </div>
            )}

            <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${isAI
                        ? "bg-surface border border-border/40 text-text-primary"
                        : "bg-brand-primary text-white"
                    }`}
            >
                {isAI ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-pre:bg-background prose-pre:border prose-pre:border-border/30 prose-pre:rounded-lg prose-code:text-brand-primary-light prose-code:text-xs prose-code:before:content-[''] prose-code:after:content-['']">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                        {isStreaming && (
                            <span className="inline-block w-1.5 h-4 bg-brand-primary-light animate-pulse ml-0.5 align-text-bottom" />
                        )}
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap">{content}</p>
                )}
            </div>

            {!isAI && (
                <div className="w-8 h-8 rounded-lg bg-brand-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-brand-primary-light" />
                </div>
            )}
        </motion.div>
    );
}

// Optimization: Memoize ChatMessage to prevent unnecessary re-renders
// of previous messages when new messages are added or during streaming.
export default memo(ChatMessage);
