"use client";

import { useState, useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface DataPoint {
  date: string;
  score: number;
  interview_type: string;
  company_context: string | null;
}

interface Props {
  data: DataPoint[];
}

type Range = "7" | "30" | "90" | "all";

const RANGES: { label: string; value: Range }[] = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
  { label: "All time", value: "all" },
];

const TYPE_LABELS: Record<string, string> = {
  dsa: "DSA",
  system_design: "System Design",
  behavioral: "Behavioral",
  sql: "SQL",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: DataPoint }>;
  label?: string;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface border border-border/60 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-text-secondary mb-1">{formatDate(d.date)}</p>
      <p className="text-text-primary font-semibold">Score: {d.score}</p>
      <p className="text-text-secondary">{TYPE_LABELS[d.interview_type] ?? d.interview_type}</p>
      {d.company_context && (
        <p className="text-text-secondary/70">{d.company_context}</p>
      )}
    </div>
  );
}

export default function ScoreTrendChart({ data }: Props) {
  const [range, setRange] = useState<Range>("30");

  const filtered = useMemo(() => {
    if (range === "all") return data;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(range));
    return data.filter((d) => new Date(d.date) >= cutoff);
  }, [data, range]);

  const chartData = filtered.map((d) => ({
    ...d,
    dateLabel: formatDate(d.date),
  }));

  return (
    <div className="rounded-xl border border-border/50 bg-surface/80 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Score Trend</h3>
          <p className="text-xs text-text-secondary mt-0.5">Overall score over time</p>
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${range === r.value
                  ? "bg-brand-primary text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface2"
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-text-secondary/50 text-sm">
          No data for selected range
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220} minWidth={1} minHeight={1}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6C3CE1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6C3CE1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: "#94A3B8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#94A3B8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#6C3CE1"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              dot={{ fill: "#6C3CE1", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "#8B5CF6" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
