"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BookMarked, SearchX, Database } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import QuestionFilters from "./QuestionFilters";
import QuestionCard, { type Question } from "./QuestionCard";

interface PracticeClientProps {
  companies: string[];
}

function QuestionSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 bg-surface px-4 py-3.5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-border/30 rounded shrink-0" />
        <div className="h-4 flex-1 bg-border/30 rounded max-w-sm" />
        <div className="h-5 w-16 bg-border/20 rounded-full hidden sm:block" />
        <div className="h-5 w-12 bg-border/20 rounded-full" />
        <div className="h-4 w-4 bg-border/20 rounded" />
      </div>
    </div>
  );
}

function EmptyState({
  type,
  isUnfiltered,
  onSeed,
  seeding,
}: {
  type: "noResults" | "bookmarks";
  isUnfiltered?: boolean;
  onSeed?: () => void;
  seeding?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {type === "bookmarks" ? (
        <>
          <BookMarked className="w-10 h-10 text-text-secondary/20 mb-4" />
          <p className="text-sm font-medium text-text-primary mb-1">
            No bookmarks yet
          </p>
          <p className="text-xs text-text-secondary/60 max-w-xs">
            You have not bookmarked any questions yet. Star questions to save
            them here.
          </p>
        </>
      ) : isUnfiltered ? (
        <>
          <Database className="w-10 h-10 text-text-secondary/20 mb-4" />
          <p className="text-sm font-medium text-text-primary mb-1">
            Question bank is empty
          </p>
          <p className="text-xs text-text-secondary/60 max-w-xs mb-4">
            Seed the database with 30 curated questions to get started.
          </p>
          {onSeed && (
            <Button
              onClick={onSeed}
              disabled={seeding}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white text-sm h-9 px-5 shadow-lg shadow-brand-primary/20"
            >
              {seeding ? "Seeding..." : "Load Questions"}
            </Button>
          )}
        </>
      ) : (
        <>
          <SearchX className="w-10 h-10 text-text-secondary/20 mb-4" />
          <p className="text-sm font-medium text-text-primary mb-1">
            No questions found
          </p>
          <p className="text-xs text-text-secondary/60 max-w-xs">
            No questions match your filters. Try broadening your search.
          </p>
        </>
      )}
    </div>
  );
}

export default function PracticeClient({ companies }: PracticeClientProps) {
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const company = searchParams.get("company") || "";
  const bookmarked = searchParams.get("bookmarked") === "true";

  // Re-fetch from page 1 whenever any filter changes
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setCurrentPage(1);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (difficulty) params.set("difficulty", difficulty);
    if (company) params.set("company", company);
    if (bookmarked) params.set("bookmarked", "true");
    params.set("page", "1");

    fetch(`/api/practice/questions?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setQuestions(data.questions ?? []);
          setTotal(data.total ?? 0);
          setBookmarkedIds(new Set<string>(data.bookmarkedIds ?? []));
          setHasMore(data.hasMore ?? false);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, difficulty, company, bookmarked]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (difficulty) params.set("difficulty", difficulty);
      if (company) params.set("company", company);
      if (bookmarked) params.set("bookmarked", "true");
      params.set("page", nextPage.toString());

      const response = await fetch(
        `/api/practice/questions?${params.toString()}`
      );
      const data = await response.json();

      setQuestions((prev) => [...prev, ...(data.questions ?? [])]);
      setHasMore(data.hasMore ?? false);
      setCurrentPage(nextPage);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleBookmarkChange = (
    questionId: string,
    isNowBookmarked: boolean
  ) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isNowBookmarked) next.add(questionId);
      else next.delete(questionId);
      return next;
    });
  };

  const showNoBookmarks = bookmarked && !isLoading && questions.length === 0;
  const showNoResults = !bookmarked && !isLoading && questions.length === 0;
  const isUnfiltered = !search && !category && !difficulty && !company && !bookmarked;

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await fetch("/api/practice/seed", { method: "POST" });
      if (res.ok) {
        toast.success("Questions loaded successfully!");
        // Trigger a re-fetch by updating a dep
        window.location.reload();
      } else {
        toast.error("Failed to load questions. Please try again.");
      }
    } catch {
      toast.error("Failed to load questions.");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <>
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Question Bank</h1>
        {!isLoading && (
          <p className="text-sm text-text-secondary mt-1">
            {total} question{total !== 1 ? "s" : ""} available
          </p>
        )}
        {isLoading && (
          <div className="h-4 w-32 bg-border/30 rounded mt-1 animate-pulse" />
        )}
      </div>

      {/* Filters */}
      <QuestionFilters companies={companies} />

      {/* Question list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <QuestionSkeleton key={i} />
          ))}
        </div>
      ) : showNoBookmarks ? (
        <EmptyState type="bookmarks" />
      ) : showNoResults ? (
        <EmptyState
          type="noResults"
          isUnfiltered={isUnfiltered}
          onSeed={isUnfiltered ? handleSeed : undefined}
          seeding={seeding}
        />
      ) : (
        <>
          <div className="space-y-2">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                isBookmarked={bookmarkedIds.has(question.id)}
                onBookmarkChange={handleBookmarkChange}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-xs text-text-secondary/50">
              Showing {questions.length} of {total} question
              {total !== 1 ? "s" : ""}
            </p>
            {hasMore && (
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="border-border/50 text-text-secondary hover:text-text-primary hover:bg-surface2 text-sm min-w-32"
              >
                {isLoadingMore ? "Loading..." : "Load More"}
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
}
