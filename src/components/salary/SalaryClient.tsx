"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import SalaryTable from "./SalaryTable";
import SalaryCompareChart from "./SalaryCompareChart";
import ContributeDialog from "./ContributeDialog";

export interface SalaryEntry {
  id: string;
  company: string;
  role: string;
  experience_years: number;
  base_salary: number;
  bonus: number;
  esop_value: number;
  total_ctc: number;
  city: string;
  verified: boolean;
  created_at: string;
}

const ROLES = ["Data Engineer", "Backend SWE", "ML Engineer"];
const CITIES = [
  { value: "all", label: "All Cities" },
  { value: "bangalore", label: "Bangalore" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "pune", label: "Pune" },
  { value: "delhi_ncr", label: "Delhi NCR" },
  { value: "chennai", label: "Chennai" },
  { value: "mumbai", label: "Mumbai" },
  { value: "remote", label: "Remote" },
];

export default function SalaryClient() {
  const [entries, setEntries] = useState<SalaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("all");
  const [city, setCity] = useState("all");
  const [minExp, setMinExp] = useState(0);
  const [maxExp, setMaxExp] = useState(15);
  const [contributeOpen, setContributeOpen] = useState(false);

  const fetchSalaries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (company) params.set("company", company);
      if (role !== "all") params.set("role", role);
      if (city !== "all") params.set("city", city);
      params.set("min_exp", String(minExp));
      params.set("max_exp", String(maxExp));

      const res = await fetch(`/api/salary?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setEntries(json.entries ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [company, role, city, minExp, maxExp]);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const filteredRole = role !== "all" ? role : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Section A: Search & Filter */}
      <div className="rounded-xl border border-border/50 bg-surface/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Search & Filter</h2>
          <Button
            onClick={() => setContributeOpen(true)}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white text-xs h-8 px-4 shadow-lg shadow-brand-primary/20"
          >
            Contribute Anonymously
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Company search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Search company..."
              className="pl-9 bg-background border-border/50 text-text-primary placeholder:text-text-secondary/40 h-9"
            />
          </div>

          {/* Role */}
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="h-9 bg-background border-border/50 text-text-primary">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border/50">
              <SelectItem value="all">All Roles</SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* City */}
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-9 bg-background border-border/50 text-text-primary">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border/50">
              {CITIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Experience range */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary whitespace-nowrap">Exp:</span>
            <Input
              type="number"
              min={0}
              max={maxExp}
              value={minExp}
              onChange={(e) => setMinExp(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 h-9 bg-background border-border/50 text-text-primary text-center px-2"
            />
            <span className="text-xs text-text-secondary">-</span>
            <Input
              type="number"
              min={minExp}
              max={15}
              value={maxExp}
              onChange={(e) => setMaxExp(Math.min(15, parseInt(e.target.value) || 15))}
              className="w-16 h-9 bg-background border-border/50 text-text-primary text-center px-2"
            />
            <span className="text-xs text-text-secondary">yrs</span>
          </div>
        </div>
      </div>

      {/* Section C: Comparison Chart */}
      <SalaryCompareChart entries={entries} selectedRole={filteredRole} />

      {/* Section B: Salary Table */}
      <SalaryTable entries={entries} loading={loading} />

      {/* Contribute Dialog */}
      <ContributeDialog
        open={contributeOpen}
        onClose={() => setContributeOpen(false)}
        onSuccess={() => {
          setContributeOpen(false);
          fetchSalaries();
        }}
      />
    </div>
  );
}
