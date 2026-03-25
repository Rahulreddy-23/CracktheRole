"use client";

import { type LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  limit?: number;
  used?: number;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  limit,
  used,
  className,
}: StatCardProps) {
  const hasUsage = limit !== undefined && used !== undefined;
  const pct = hasUsage && limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  const progressColor =
    pct > 80 ? "text-red-400" : pct > 50 ? "text-yellow-400" : "text-emerald-400";

  return (
    <div
      className={cn(
        "glass rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden",
        className
      )}
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="w-5 h-5 text-muted-foreground/50 shrink-0" />
      </div>

      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {hasUsage && (
          <span className="text-sm text-muted-foreground mb-1 font-medium">
            / {limit}
          </span>
        )}
      </div>

      {hasUsage && (
        <div className="space-y-1.5">
          <Progress value={pct} className="h-1.5" />
          <p className={cn("text-xs font-medium", progressColor)}>
            {used} of {limit} used
          </p>
        </div>
      )}
    </div>
  );
}
