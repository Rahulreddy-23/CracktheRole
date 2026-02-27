"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { SalaryEntry } from "./SalaryClient";

interface Props {
  entries: SalaryEntry[];
  selectedRole?: string;
}

const COMPANY_COLORS = [
  "#6C3CE1", "#06B6D4", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#84CC16",
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border/60 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-text-primary font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: {p.value}L
        </p>
      ))}
    </div>
  );
}

export default function SalaryCompareChart({ entries, selectedRole }: Props) {
  const chartData = useMemo(() => {
    const filtered = selectedRole
      ? entries.filter((e) => e.role === selectedRole)
      : entries;

    const byCompany: Record<string, { base: number[]; bonus: number[]; esop: number[] }> = {};

    for (const e of filtered) {
      if (!byCompany[e.company]) {
        byCompany[e.company] = { base: [], bonus: [], esop: [] };
      }
      byCompany[e.company].base.push(e.base_salary);
      byCompany[e.company].bonus.push(e.bonus);
      byCompany[e.company].esop.push(e.esop_value);
    }

    function mean(arr: number[]) {
      if (!arr.length) return 0;
      return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    }

    return Object.entries(byCompany)
      .map(([company, vals]) => ({
        company,
        Base: mean(vals.base),
        Bonus: mean(vals.bonus),
        ESOP: mean(vals.esop),
      }))
      .sort((a, b) => b.Base + b.Bonus + b.ESOP - (a.Base + a.Bonus + a.ESOP))
      .slice(0, 10);
  }, [entries, selectedRole]);

  return (
    <div className="rounded-xl border border-border/50 bg-surface/80 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Average CTC by Company</h3>
        <p className="text-xs text-text-secondary mt-0.5">
          {selectedRole ? `Filtered by: ${selectedRole}` : "All roles"} — stacked base + bonus + ESOP (LPA)
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-text-secondary/50 text-sm">
          No data to compare
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="company"
              tick={{ fill: "#94A3B8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94A3B8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}L`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#94A3B8" }}
            />
            <Bar dataKey="Base" stackId="a" fill="#6C3CE1" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Bonus" stackId="a" fill="#06B6D4" radius={[0, 0, 0, 0]} />
            <Bar dataKey="ESOP" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
