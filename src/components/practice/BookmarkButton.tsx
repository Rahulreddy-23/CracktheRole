"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  questionId: string;
  isBookmarked: boolean;
  onToggle: (questionId: string, isNowBookmarked: boolean) => void;
  size?: "sm" | "md";
}

export default function BookmarkButton({
  questionId,
  isBookmarked,
  onToggle,
  size = "md",
}: BookmarkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    const nextState = !isBookmarked;
    setIsLoading(true);

    try {
      const response = await fetch("/api/practice/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          action: nextState ? "add" : "remove",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update bookmark");
      }

      onToggle(questionId, nextState);
      toast.success(nextState ? "Bookmarked" : "Bookmark removed", {
        duration: 1500,
      });
    } catch {
      toast.error("Could not update bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  const iconClass = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this question"}
      className={cn(
        "transition-colors duration-150 shrink-0",
        isBookmarked
          ? "text-brand-warning hover:text-brand-warning/70"
          : "text-text-secondary/40 hover:text-brand-warning",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      <Star className={cn(iconClass, isBookmarked && "fill-current")} />
    </button>
  );
}
