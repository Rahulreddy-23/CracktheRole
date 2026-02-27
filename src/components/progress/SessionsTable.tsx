"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Session {
  id: string;
  created_at: string;
  interview_type: string;
  company_context: string | null;
  difficulty: string;
  overall_score: number | null;
  duration_seconds: number | null;
  status: string;
}

interface Props {
  sessions: Session[];
}

type SortKey = keyof Session;
type SortDir = "asc" | "desc";

const PAGE_SIZE = 15;

const TYPE_LABELS: Record<string, string> = {
  dsa: "DSA",
  system_design: "System Design",
  behavioral: "Behavioral",
  sql: "SQL",
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function scoreColor(score: number | null): string {
  if (score === null) return "text-text-secondary/50";
  if (score >= 85) return "text-brand-success";
  if (score >= 70) return "text-cyan-400";
  if (score >= 55) return "text-brand-warning";
  return "text-brand-danger";
}

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
  return sortDir === "asc"
    ? <ChevronUp className="w-3 h-3" />
    : <ChevronDown className="w-3 h-3" />;
}

export default function SessionsTable({ sessions }: Props) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  const sorted = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [sessions, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const headers: { label: string; key: SortKey }[] = [
    { label: "Date", key: "created_at" },
    { label: "Type", key: "interview_type" },
    { label: "Company", key: "company_context" },
    { label: "Difficulty", key: "difficulty" },
    { label: "Score", key: "overall_score" },
    { label: "Duration", key: "duration_seconds" },
    { label: "Status", key: "status" },
  ];

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-surface/80 p-8 text-center">
        <p className="text-text-secondary/60 text-sm">No interview sessions yet. Start your first interview to see history here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-surface/80 overflow-hidden">
      <div className="p-5 border-b border-border/30">
        <h3 className="text-sm font-semibold text-text-primary">Interview History</h3>
        <p className="text-xs text-text-secondary mt-0.5">{sessions.length} sessions total</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/20">
              {headers.map((h) => (
                <th
                  key={h.key}
                  onClick={() => toggleSort(h.key)}
                  className="px-4 py-3 text-left text-xs font-medium text-text-secondary cursor-pointer hover:text-text-primary select-none"
                >
                  <div className="flex items-center gap-1">
                    {h.label}
                    <SortIcon column={h.key} sortKey={sortKey} sortDir={sortDir} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((s) => (
              <tr
                key={s.id}
                onClick={() => s.status === "completed" && router.push(`/interview/review/${s.id}`)}
                className={`border-b border-border/10 transition-colors ${
                  s.status === "completed"
                    ? "cursor-pointer hover:bg-surface2/60"
                    : "opacity-60"
                }`}
              >
                <td className="px-4 py-3 text-text-secondary text-xs whitespace-nowrap">
                  {new Date(s.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-text-primary text-xs font-medium whitespace-nowrap">
                  {TYPE_LABELS[s.interview_type] ?? s.interview_type}
                </td>
                <td className="px-4 py-3 text-text-secondary text-xs">
                  {s.company_context ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    s.difficulty === "easy"
                      ? "bg-brand-success/10 text-brand-success border-brand-success/20"
                      : s.difficulty === "medium"
                      ? "bg-brand-warning/10 text-brand-warning border-brand-warning/20"
                      : "bg-brand-danger/10 text-brand-danger border-brand-danger/20"
                  }`}>
                    {s.difficulty}
                  </span>
                </td>
                <td className={`px-4 py-3 text-xs font-bold ${scoreColor(s.overall_score)}`}>
                  {s.overall_score !== null ? `${s.overall_score}` : "-"}
                </td>
                <td className="px-4 py-3 text-text-secondary text-xs whitespace-nowrap">
                  {formatDuration(s.duration_seconds)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    s.status === "completed"
                      ? "bg-brand-success/10 text-brand-success border-brand-success/20"
                      : s.status === "in_progress"
                      ? "bg-brand-primary/10 text-brand-primary-light border-brand-primary/20"
                      : "bg-border/20 text-text-secondary border-border/30"
                  }`}>
                    {s.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/20">
          <p className="text-xs text-text-secondary">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-7 text-xs border-border/50 bg-transparent text-text-secondary hover:text-text-primary"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="h-7 text-xs border-border/50 bg-transparent text-text-secondary hover:text-text-primary"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
