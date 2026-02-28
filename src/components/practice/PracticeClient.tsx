"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  BookmarkIcon,
  CheckCircle2,
  Code2,
  RotateCcw,
  ChevronRight,
  Loader2,
  Database,
  Tag,
  Building2,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BookmarkButton from "./BookmarkButton";
import toast from "react-hot-toast";

export interface Question {
  id: string;
  title: string;
  description: string;
  category: "dsa" | "system_design" | "behavioral" | "sql";
  difficulty: "easy" | "medium" | "hard";
  company_tags: string[];
  topic_tags: string[];
  hints: string[];
  solution: string | null;
  starter_code: Record<string, string> | null;
  test_cases: unknown;
  question_number: number | null;
  function_name: string | null;
  params: Array<{ name: string; type: string }> | null;
  return_type: string | null;
  created_at: string;
}

interface PracticeClientProps {
  companies: string[];
}

const DIFF_CONFIG = {
  easy:   { label: "Easy",   cls: "text-[#10B981]" },
  medium: { label: "Medium", cls: "text-[#F59E0B]" },
  hard:   { label: "Hard",   cls: "text-[#EF4444]" },
};

const CATEGORY_TABS = [
  { value: "",               label: "All"           },
  { value: "dsa",            label: "DSA"           },
  { value: "system_design",  label: "System Design" },
  { value: "behavioral",     label: "Behavioral"    },
  { value: "sql",            label: "SQL"           },
];

const DIFF_FILTERS = [
  { value: "", label: "All" },
  { value: "easy",   label: "Easy"   },
  { value: "medium", label: "Medium" },
  { value: "hard",   label: "Hard"   },
];

export default function PracticeClient({ companies }: PracticeClientProps) {
  const router = useRouter();
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

  // Local search (debounced via URL)
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const category   = searchParams.get("category") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const search     = searchParams.get("search") || "";
  const bookmarked = searchParams.get("bookmarked") === "true";

  const setParam = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (value) p.set(key, value);
      else p.delete(key);
      p.delete("page");
      router.push(`/practice?${p.toString()}`);
    },
    [searchParams, router]
  );

  // Fetch solved IDs
  useEffect(() => {
    fetch("/api/practice/completions")
      .then((r) => r.json())
      .then((d) => { if (d.completedIds) setSolvedIds(new Set<string>(d.completedIds)); })
      .catch(() => {});
  }, []);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchInput !== search) setParam("search", searchInput);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQuestions = useCallback(async (page: number, append = false) => {
    if (!append) setIsLoading(true);
    else setIsLoadingMore(true);

    const p = new URLSearchParams();
    if (search)     p.set("search", search);
    if (category)   p.set("category", category);
    if (difficulty) p.set("difficulty", difficulty);
    if (bookmarked) p.set("bookmarked", "true");
    p.set("page", String(page));

    try {
      const res  = await fetch(`/api/practice/questions?${p.toString()}`);
      const data = await res.json();
      const qs   = data.questions ?? [];

      if (!append) {
        setQuestions(qs);
      } else {
        setQuestions((prev) => [...prev, ...qs]);
      }
      setTotal(data.total ?? 0);
      setBookmarkedIds(new Set<string>(data.bookmarkedIds ?? []));
      setHasMore(data.hasMore ?? false);
      setCurrentPage(page);

      // Auto-seed if completely empty and no filters
      const unfiltered = !search && !category && !difficulty && !bookmarked;
      if (qs.length === 0 && unfiltered && page === 1) {
        handleSeed();
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [search, category, difficulty, bookmarked]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchQuestions(1);
  }, [fetchQuestions]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/practice/seed", { method: "POST" });
      if (res.ok) {
        toast.success("Questions loaded.");
        await fetchQuestions(1);
      } else {
        const d = await res.json();
        toast.error(d.error || "Seed failed.");
      }
    } catch {
      toast.error("Could not reach seed endpoint.");
    } finally {
      setSeeding(false);
    }
  };

  const toggleBookmark = (id: string, isBookmarked: boolean) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isBookmarked) next.add(id); else next.delete(id);
      return next;
    });
  };

  // Stats
  const easy   = questions.filter((q) => q.difficulty === "easy").length;
  const medium = questions.filter((q) => q.difficulty === "medium").length;
  const hard   = questions.filter((q) => q.difficulty === "hard").length;
  const solved = questions.filter((q) => solvedIds.has(q.id)).length;

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Problem Bank</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Practice DSA, System Design, Behavioral, and SQL problems
        </p>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────────── */}
      {!isLoading && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5 text-xs text-text-secondary"
        >
          <span className="font-semibold text-text-primary text-sm">{total} Problems</span>
          <span className="text-[#10B981]">{easy} Easy</span>
          <span className="text-[#F59E0B]">{medium} Medium</span>
          <span className="text-[#EF4444]">{hard} Hard</span>
          {solved > 0 && (
            <span className="flex items-center gap-1 text-brand-primary-light">
              <CheckCircle2 className="w-3 h-3" />
              {solved} Solved
            </span>
          )}
        </motion.div>
      )}

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className="space-y-3 mb-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/40" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search problems..."
            className="w-full pl-9 pr-4 h-10 rounded-xl bg-surface border border-border/40 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-brand-primary/40 transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setParam("search", ""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/40 hover:text-text-secondary"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category + Difficulty + Bookmarked */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category tabs */}
          <div className="flex items-center bg-surface border border-border/40 rounded-lg p-0.5 gap-0.5">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setParam("category", tab.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  category === tab.value
                    ? "bg-brand-primary text-white"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex items-center bg-surface border border-border/40 rounded-lg p-0.5 gap-0.5">
            {DIFF_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setParam("difficulty", f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  difficulty === f.value
                    ? "bg-brand-primary text-white"
                    : f.value
                    ? DIFF_CONFIG[f.value as keyof typeof DIFF_CONFIG]?.cls ?? "text-text-secondary"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Bookmarked toggle */}
          <button
            onClick={() => setParam("bookmarked", bookmarked ? "" : "true")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
              bookmarked
                ? "bg-brand-primary/15 text-brand-primary-light border-brand-primary/30"
                : "border-border/40 text-text-secondary hover:text-text-primary bg-surface"
            )}
          >
            <BookmarkIcon className={cn("w-3.5 h-3.5", bookmarked && "fill-current")} />
            Bookmarked
          </button>
        </div>
      </div>

      {/* ── Table header ────────────────────────────────────────────────────── */}
      {!isLoading && total > 0 && (
        <div className="hidden sm:grid grid-cols-[2rem_1fr_6rem_6rem_4rem] gap-4 px-4 py-2 text-[11px] font-medium text-text-secondary/50 uppercase tracking-wider border-b border-border/30 mb-1">
          <span>#</span>
          <span>Title</span>
          <span>Category</span>
          <span>Difficulty</span>
          <span></span>
        </div>
      )}

      {/* ── Questions list ──────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-1.5 mt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-surface/60 animate-pulse border border-border/20" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Database className="w-10 h-10 text-text-secondary/20 mb-4" />
          <p className="text-sm font-medium text-text-primary mb-1">
            {bookmarked ? "No bookmarked questions" : search || category || difficulty ? "No results" : "Question bank is empty"}
          </p>
          <p className="text-xs text-text-secondary/50 mb-4">
            {bookmarked
              ? "Bookmark questions to see them here."
              : search || category || difficulty
              ? "Try adjusting your filters."
              : "Run the V2 migration in Supabase, then seed below."}
          </p>
          {!bookmarked && !search && !category && !difficulty && (
            <Button
              onClick={handleSeed}
              disabled={seeding}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs h-8 px-4"
            >
              {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              {seeding ? "Seeding..." : "Seed 5 Problems"}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-0.5">
          {questions.map((q, i) => {
            const diff = DIFF_CONFIG[q.difficulty];
            const isSolved = solvedIds.has(q.id);
            const isBookmarked = bookmarkedIds.has(q.id);
            const canSolve = q.category === "dsa" && Boolean(q.function_name);

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className={cn(
                  "group grid grid-cols-[2rem_1fr] sm:grid-cols-[2rem_1fr_6rem_6rem_4rem] gap-4 items-center px-4 py-3.5 rounded-lg border transition-all cursor-pointer",
                  isSolved
                    ? "border-brand-success/20 bg-brand-success/3 hover:bg-brand-success/5"
                    : "border-transparent hover:border-border/40 hover:bg-surface/60"
                )}
                onClick={() => canSolve && router.push(`/practice/solve/${q.id}`)}
              >
                {/* Number / solved indicator */}
                <div className="flex items-center justify-center">
                  {isSolved ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                  ) : (
                    <span className="text-xs text-text-secondary/40 font-mono tabular-nums">
                      {q.question_number ?? i + 1}
                    </span>
                  )}
                </div>

                {/* Title + tags */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      "text-sm font-medium truncate transition-colors",
                      canSolve
                        ? "text-text-primary group-hover:text-brand-primary-light"
                        : "text-text-primary"
                    )}>
                      {q.title}
                    </span>
                    {/* Topic tags — first 2 on larger screens */}
                    {q.topic_tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded-full bg-surface text-text-secondary/60 border border-border/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Company tags on small screens */}
                  <div className="sm:hidden flex items-center gap-2 mt-0.5">
                    <span className={cn("text-[11px] font-medium", diff.cls)}>{diff.label}</span>
                    {q.company_tags.slice(0, 2).map((c) => (
                      <span key={c} className="text-[10px] text-text-secondary/50">{c}</span>
                    ))}
                  </div>
                </div>

                {/* Category badge */}
                <div className="hidden sm:flex">
                  <span className="text-[11px] text-text-secondary/60 capitalize">
                    {q.category === "system_design" ? "System Design" : q.category.toUpperCase()}
                  </span>
                </div>

                {/* Difficulty */}
                <div className="hidden sm:flex">
                  <span className={cn("text-[11px] font-medium", diff.cls)}>{diff.label}</span>
                </div>

                {/* Actions */}
                <div className="hidden sm:flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <BookmarkButton
                    questionId={q.id}
                    isBookmarked={isBookmarked}
                    size="sm"
                    onToggle={(_, isNowBookmarked) => toggleBookmark(q.id, isNowBookmarked)}
                  />
                  {canSolve && (
                    <Link
                      href={`/practice/solve/${q.id}`}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-text-secondary/40 hover:text-brand-primary-light hover:bg-brand-primary/10 transition-colors"
                      title="Solve"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Load more ───────────────────────────────────────────────────────── */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchQuestions(currentPage + 1, true)}
            disabled={isLoadingMore}
            className="border-border/40 text-text-secondary hover:text-text-primary text-xs"
          >
            {isLoadingMore ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 mr-1.5" />
            )}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
