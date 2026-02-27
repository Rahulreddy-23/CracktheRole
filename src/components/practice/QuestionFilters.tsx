"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "dsa", label: "DSA" },
  { value: "system_design", label: "System Design" },
  { value: "behavioral", label: "Behavioral" },
  { value: "sql", label: "SQL" },
];

const DIFFICULTIES = [
  { value: "all", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

interface QuestionFiltersProps {
  companies: string[];
}

export default function QuestionFilters({ companies }: QuestionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "all";
  const currentDifficulty = searchParams.get("difficulty") || "all";
  const currentCompany = searchParams.get("company") || "all";
  const currentBookmarked = searchParams.get("bookmarked") === "true";

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Sync local search input if the URL param changes externally
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (
          value === null ||
          value === "" ||
          value === "all" ||
          value === "false"
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  // Debounce the search input before writing to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateParams({ search: searchInput || null });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, currentSearch, updateParams]);

  // Derive active filter chips (excludes search which has its own clear button)
  const activeFilters: { key: string; label: string }[] = [];

  if (currentCategory !== "all") {
    const cat = CATEGORIES.find((c) => c.value === currentCategory);
    if (cat) activeFilters.push({ key: "category", label: cat.label });
  }
  if (currentDifficulty !== "all") {
    const diff = DIFFICULTIES.find((d) => d.value === currentDifficulty);
    if (diff) activeFilters.push({ key: "difficulty", label: diff.label });
  }
  if (currentCompany !== "all") {
    activeFilters.push({ key: "company", label: currentCompany });
  }
  if (currentBookmarked) {
    activeFilters.push({ key: "bookmarked", label: "Bookmarked" });
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 bg-surface border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 transition-colors"
        />
        {searchInput && (
          <button
            onClick={() => {
              setSearchInput("");
              updateParams({ search: null });
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-text-secondary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category tabs */}
        <div className="flex items-center gap-0.5 bg-surface border border-border/50 rounded-lg p-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateParams({ category: cat.value })}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                currentCategory === cat.value
                  ? "bg-brand-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Difficulty buttons */}
        <div className="flex items-center gap-0.5 bg-surface border border-border/50 rounded-lg p-1">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff.value}
              onClick={() => updateParams({ difficulty: diff.value })}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                currentDifficulty === diff.value
                  ? "bg-brand-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {diff.label}
            </button>
          ))}
        </div>

        {/* Company dropdown */}
        <Select
          value={currentCompany}
          onValueChange={(val) => updateParams({ company: val })}
        >
          <SelectTrigger className="h-8 text-xs w-40 bg-surface border-border/50 text-text-secondary focus:ring-brand-primary/20">
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent className="bg-surface border-border/50 text-text-primary">
            <SelectItem value="all" className="text-xs">
              All Companies
            </SelectItem>
            {companies.map((company) => (
              <SelectItem key={company} value={company} className="text-xs">
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bookmarked toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <Switch
            id="bookmarked-toggle"
            checked={currentBookmarked}
            onCheckedChange={(checked) =>
              updateParams({ bookmarked: checked ? "true" : null })
            }
          />
          <Label
            htmlFor="bookmarked-toggle"
            className="text-xs text-text-secondary cursor-pointer select-none"
          >
            Bookmarked only
          </Label>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="outline"
              className="text-xs border-brand-primary/30 bg-brand-primary/10 text-brand-primary-light gap-1 pr-1.5"
            >
              {filter.label}
              <button
                onClick={() => updateParams({ [filter.key]: null })}
                aria-label={`Remove ${filter.label} filter`}
                className="ml-0.5 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {activeFilters.length > 1 && (
            <button
              onClick={() => router.push(pathname)}
              className="text-xs text-text-secondary/50 hover:text-text-secondary transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
