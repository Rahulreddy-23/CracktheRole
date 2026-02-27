"use client";

import Link from "next/link";
import { Crown, Zap, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  tier: "free" | "pro" | "elite";
  interviewsThisWeek: number;
}

const TIER_CONFIG = {
  free: {
    label: "Free",
    icon: Star,
    color: "text-text-secondary",
    bgColor: "bg-border/20",
    limit: 3,
  },
  pro: {
    label: "Pro",
    icon: Zap,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/15",
    limit: null,
  },
  elite: {
    label: "Elite",
    icon: Crown,
    color: "text-amber-400",
    bgColor: "bg-amber-500/15",
    limit: null,
  },
};

export default function SubscriptionStatus({ tier, interviewsThisWeek }: Props) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;
  const usedThisWeek = Math.min(interviewsThisWeek, config.limit ?? interviewsThisWeek);

  return (
    <div className="rounded-xl border border-border/50 bg-surface/80 p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Subscription</h3>

      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <p className="text-xs text-text-secondary">Current Plan</p>
          <Badge
            className={`text-xs font-semibold mt-0.5 ${config.bgColor} ${config.color} border-0`}
          >
            {config.label}
          </Badge>
        </div>
      </div>

      {tier === "free" && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-text-secondary">Interviews this week</span>
              <span className="text-xs font-medium text-text-primary">
                {usedThisWeek}/{config.limit}
              </span>
            </div>
            <Progress
              value={(usedThisWeek / (config.limit ?? 1)) * 100}
              className="h-1.5 bg-border/30"
            />
          </div>

          <div className="rounded-lg bg-brand-primary/10 border border-brand-primary/20 p-4 mb-4">
            <p className="text-xs text-text-primary font-medium mb-1">Upgrade to Pro</p>
            <p className="text-xs text-text-secondary">
              Get unlimited interviews, advanced analytics, and priority AI responses.
            </p>
          </div>

          <Button
            asChild
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white h-9 text-sm font-medium shadow-lg shadow-brand-primary/20"
          >
            <Link href="/pricing">Upgrade to Pro</Link>
          </Button>
        </>
      )}

      {tier !== "free" && (
        <p className="text-xs text-brand-success">
          You have unlimited access to all interview types and features.
        </p>
      )}
    </div>
  );
}
