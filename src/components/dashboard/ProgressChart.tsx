"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface DataPoint {
    date: string;
    score: number;
}

interface ProgressChartProps {
    data: DataPoint[];
}

function formatChartDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function ProgressChart({ data }: ProgressChartProps) {
    if (data.length < 2) {
        return (
            <div className="rounded-xl border border-border/50 bg-surface p-5">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-text-secondary/50" />
                    <h3 className="text-sm font-semibold text-text-primary">
                        Score Trend
                    </h3>
                </div>
                <p className="text-xs text-text-secondary/60 leading-relaxed">
                    Complete more interviews to see your progress trend here.
                </p>
            </div>
        );
    }

    const chartData = data.map((d) => ({
        ...d,
        label: formatChartDate(d.date),
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-xl border border-border/50 bg-surface p-5"
        >
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-brand-primary-light" />
                <h3 className="text-sm font-semibold text-text-primary">
                    Score Trend
                </h3>
            </div>

            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="0%"
                                    stopColor="rgba(108,60,225,0.4)"
                                    stopOpacity={1}
                                />
                                <stop
                                    offset="100%"
                                    stopColor="rgba(108,60,225,0.02)"
                                    stopOpacity={1}
                                />
                            </linearGradient>
                        </defs>

                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: "#94A3B8" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 10, fill: "#94A3B8" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: "#1A1A2E",
                                border: "1px solid rgba(30,41,59,0.6)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "#FFFFFF",
                            }}
                            labelStyle={{ color: "#94A3B8", fontSize: "10px" }}
                            formatter={(value: number | undefined) => [`${value ?? 0}%`, "Score"]}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#6C3CE1"
                            strokeWidth={2}
                            fill="url(#scoreGradient)"
                            dot={{
                                r: 3,
                                fill: "#6C3CE1",
                                stroke: "#1A1A2E",
                                strokeWidth: 2,
                            }}
                            activeDot={{
                                r: 5,
                                fill: "#8B5CF6",
                                stroke: "#1A1A2E",
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
