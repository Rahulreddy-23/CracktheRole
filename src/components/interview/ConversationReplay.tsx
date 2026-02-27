"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ChatMessage from "@/components/interview/ChatMessage";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ConversationReplayProps {
    messages: Message[];
}

export default function ConversationReplay({
    messages,
}: ConversationReplayProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!messages || messages.length === 0) {
        return null;
    }

    return (
        <div className="bg-surface rounded-xl border border-border/40 overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-surface2/50 transition-colors"
            >
                <div>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                        View Full Conversation
                    </h3>
                    <span className="text-xs text-text-secondary/50">
                        {messages.length} messages
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-text-secondary" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-border/30 px-4 py-4 space-y-4 max-h-[500px] overflow-y-auto">
                            {messages.map((msg, i) => (
                                <ChatMessage
                                    key={i}
                                    role={msg.role}
                                    content={msg.content}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
