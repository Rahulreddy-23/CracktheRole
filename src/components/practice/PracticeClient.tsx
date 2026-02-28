"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BookMarked, SearchX, Database, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
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
        <div className="w-6 h-4 bg-border/30 rounded shrink-0" />
        <div className="w-4 h-4 bg-border/30 rounded shrink-0" />
        <div className="h-4 flex-1 bg-border/30 rounded max-w-sm" />
        <div className="h-5 w-16 bg-border/20 rounded-full hidden sm:block" />
        <div className="h-5 w-12 bg-border/20 rounded-full" />
        <div className="h-4 w-4 bg-border/20 rounded" />
      </div>
    </div>
  );
}

function StatsHeader({
  total,
  easyCt,
  mediumCt,
  hardCt,
  solvedCt,
}: {
  total: number;
  easyCt: number;
  mediumCt: number;
  hardCt: number;
  solvedCt: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border border-border/40 bg-surface/80"
    >
      <div className="flex items-center gap-2 mr-4">
        <BarChart3 className="w-4 h-4 text-text-secondary/50" />
        <span className="text-sm font-semibold text-text-primary">
          {total} <span className="text-text-secondary font-normal">Problems</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[11px] bg-brand-success/15 text-brand-success border-brand-success/30 gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-success inline-block" />
          Easy {easyCt}
        </Badge>
        <Badge variant="outline" className="text-[11px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30 gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
          Medium {mediumCt}
        </Badge>
        <Badge variant="outline" className="text-[11px] bg-brand-danger/15 text-brand-danger border-brand-danger/30 gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-danger inline-block" />
          Hard {hardCt}
        </Badge>
      </div>

      <div className="ml-auto">
        <Badge variant="outline" className="text-[11px] bg-brand-primary/15 text-brand-primary-light border-brand-primary/30">
          ✓ Solved {solvedCt}
        </Badge>
      </div>
    </motion.div>
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
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const company = searchParams.get("company") || "";
  const topic = searchParams.get("topic") || "";
  const bookmarked = searchParams.get("bookmarked") === "true";

  const [autoSeeded, setAutoSeeded] = useState(false);

  // Fetch solved question IDs
  useEffect(() => {
    fetch("/api/practice/completions")
      .then((r) => r.json())
      .then((data) => {
        if (data.completedIds) {
          setSolvedIds(new Set<string>(data.completedIds));
        }
      })
      .catch(() => { /* ignore */ });
  }, []);

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
    if (topic) params.set("topic", topic);
    if (bookmarked) params.set("bookmarked", "true");
    params.set("page", "1");

    fetch(`/api/practice/questions?${params.toString()}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (cancelled) return;

        const fetchedQuestions = data.questions ?? [];
        const isUnfilteredLoad =
          !search && !category && !difficulty && !company && !topic && !bookmarked;

        // Auto-seed: if DB is empty and no filters applied, seed automatically
        if (fetchedQuestions.length === 0 && isUnfilteredLoad && !autoSeeded) {
          setAutoSeeded(true);
          setSeeding(true);
          try {
            const seedRes = await fetch("/api/practice/seed", {
              method: "POST",
            });
            if (seedRes.ok) {
              toast.success("Question bank seeded with curated questions.");
              // Re-fetch after seeding
              const refetch = await fetch(
                `/api/practice/questions?page=1`
              );
              const refetchData = await refetch.json();
              if (!cancelled) {
                setQuestions(refetchData.questions ?? []);
                setTotal(refetchData.total ?? 0);
                setBookmarkedIds(
                  new Set<string>(refetchData.bookmarkedIds ?? [])
                );
                setHasMore(refetchData.hasMore ?? false);
              }
            } else {
              toast.error("Failed to auto-seed questions.");
            }
          } catch {
            toast.error("Failed to auto-seed questions.");
          } finally {
            if (!cancelled) {
              setSeeding(false);
              setIsLoading(false);
            }
          }
          return;
        }

        setQuestions(fetchedQuestions);
        setTotal(data.total ?? 0);
        setBookmarkedIds(new Set<string>(data.bookmarkedIds ?? []));
        setHasMore(data.hasMore ?? false);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, difficulty, company, topic, bookmarked]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (difficulty) params.set("difficulty", difficulty);
      if (company) params.set("company", company);
      if (topic) params.set("topic", topic);
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
  const isUnfiltered = !search && !category && !difficulty && !company && !topic && !bookmarked;

  // Compute stats from all loaded questions
  const easyCt = questions.filter((q) => q.difficulty === "easy").length;
  const mediumCt = questions.filter((q) => q.difficulty === "medium").length;
  const hardCt = questions.filter((q) => q.difficulty === "hard").length;

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await fetch("/api/practice/seed", { method: "POST" });
      if (res.ok) {
        toast.success("Questions loaded successfully!");
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
            Practice problems to sharpen your skills
          </p>
        )}
        {isLoading && (
          <div className="h-4 w-32 bg-border/30 rounded mt-1 animate-pulse" />
        )}
      </div>

      {/* Stats header */}
      {!isLoading && questions.length > 0 && (
        <StatsHeader
          total={total}
          easyCt={easyCt}
          mediumCt={mediumCt}
          hardCt={hardCt}
          solvedCt={solvedIds.size}
        />
      )}

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
            {questions.map((question, idx) => (
              <QuestionCard
                key={question.id}
                question={question}
                isBookmarked={bookmarkedIds.has(question.id)}
                isSolved={solvedIds.has(question.id)}
                index={idx}
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
