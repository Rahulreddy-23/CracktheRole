"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SalaryEntry } from "./SalaryClient";

interface Props {
  entries: SalaryEntry[];
  loading: boolean;
}

type SortKey = keyof SalaryEntry;
type SortDir = "asc" | "desc";

const PAGE_SIZE = 15;

const CITY_LABELS: Record<string, string> = {
  bangalore: "Bangalore",
  hyderabad: "Hyderabad",
  pune: "Pune",
  delhi_ncr: "Delhi NCR",
  chennai: "Chennai",
  mumbai: "Mumbai",
  remote: "Remote",
};

function formatLPA(val: number): string {
  if (val >= 100) return `${(val / 100).toFixed(1)}Cr`;
  return `${val}L`;
}

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
  return sortDir === "asc"
    ? <ChevronUp className="w-3 h-3" />
    : <ChevronDown className="w-3 h-3" />;
}

const headers: { label: string; key: SortKey }[] = [
  { label: "Company", key: "company" },
  { label: "Role", key: "role" },
  { label: "Exp (yrs)", key: "experience_years" },
  { label: "Base", key: "base_salary" },
  { label: "Bonus", key: "bonus" },
  { label: "ESOP", key: "esop_value" },
  { label: "Total CTC", key: "total_ctc" },
  { label: "City", key: "city" },
];

export default function SalaryTable({ entries, loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("total_ctc");
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
    return [...entries].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [entries, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-surface/80 overflow-hidden">
        <div className="p-5 border-b border-border/30">
          <div className="h-4 w-32 bg-border/20 rounded animate-pulse" />
        </div>
        <div className="p-8 flex justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-surface/80 overflow-hidden">
      <div className="p-5 border-b border-border/30">
        <h3 className="text-sm font-semibold text-text-primary">Salary Data</h3>
        <p className="text-xs text-text-secondary mt-0.5">{entries.length} entries — all figures in LPA</p>
      </div>

      {entries.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-text-secondary/60 text-sm">
            No salary data found. Be the first to contribute!
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/20">
                  {headers.map((h) => (
                    <th
                      key={String(h.key)}
                      onClick={() => toggleSort(h.key)}
                      className="px-4 py-3 text-left text-xs font-medium text-text-secondary cursor-pointer hover:text-text-primary select-none whitespace-nowrap"
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
                {paged.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-border/10 hover:bg-surface2/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-text-primary text-xs font-medium whitespace-nowrap">{e.company}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs whitespace-nowrap">{e.role}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs text-center">{e.experience_years}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{formatLPA(e.base_salary)}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{formatLPA(e.bonus)}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{formatLPA(e.esop_value)}</td>
                    <td className="px-4 py-3 text-brand-primary-light text-xs font-bold">{formatLPA(e.total_ctc)}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs whitespace-nowrap">{CITY_LABELS[e.city] ?? e.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/20">
              <p className="text-xs text-text-secondary">Page {page + 1} of {totalPages}</p>
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
        </>
      )}
    </div>
  );
}
