"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  technical: number;
  communication: number;
  problemSolving: number;
  timeManagement: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { subject: string } }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border/60 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-text-secondary">{payload[0].payload.subject}</p>
      <p className="text-text-primary font-semibold">{payload[0].value.toFixed(0)}</p>
    </div>
  );
}

export default function CategoryRadarChart({ technical, communication, problemSolving, timeManagement }: Props) {
  const data = [
    { subject: "Technical", value: technical },
    { subject: "Communication", value: communication },
    { subject: "Problem Solving", value: problemSolving },
    { subject: "Time Mgmt", value: timeManagement },
  ];

  const hasData = technical > 0 || communication > 0 || problemSolving > 0 || timeManagement > 0;

  return (
    <div className="rounded-xl border border-border/50 bg-surface/80 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Category Breakdown</h3>
        <p className="text-xs text-text-secondary mt-0.5">Average scores across all sessions</p>
      </div>

      {!hasData ? (
        <div className="h-52 flex items-center justify-center text-text-secondary/50 text-sm">
          Complete an interview to see breakdown
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220} minWidth={1} minHeight={1}>
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.06)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#94A3B8", fontSize: 11 }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#6C3CE1"
              fill="#6C3CE1"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
