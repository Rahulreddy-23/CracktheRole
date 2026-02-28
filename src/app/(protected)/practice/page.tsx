import type { Metadata } from "next";
import { Suspense } from "react";
import PracticeClient from "@/components/practice/PracticeClient";
import BackToDashboard from "@/components/shared/BackToDashboard";

export const metadata: Metadata = {
  title: "Question Bank",
  description:
    "Browse and practice DSA, system design, behavioral, and SQL questions tagged by company and difficulty.",
};

// All companies used across the 30 seed questions.
// Update this list when adding new questions with different company tags.
const COMPANIES = [
  "Adobe",
  "Akamai",
  "Amazon",
  "Apple",
  "Cloudflare",
  "Google",
  "Kong",
  "LinkedIn",
  "Meta",
  "Microsoft",
  "Netflix",
  "Oracle",
  "SAP",
  "Shopify",
  "Slack",
  "Stripe",
  "Twitter/X",
  "Uber",
];

function PracticePageSkeleton() {
  return (
    <div>
      {/* Heading skeleton */}
      <div className="mb-6">
        <div className="h-7 w-44 bg-border/30 rounded-lg animate-pulse mb-1.5" />
        <div className="h-4 w-32 bg-border/20 rounded animate-pulse" />
      </div>

      {/* Filter skeleton */}
      <div className="space-y-3 mb-6">
        <div className="h-10 w-full bg-border/20 rounded-lg animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-64 bg-border/20 rounded-lg animate-pulse" />
          <div className="h-8 w-48 bg-border/20 rounded-lg animate-pulse" />
          <div className="h-8 w-36 bg-border/20 rounded-lg animate-pulse ml-auto" />
        </div>
      </div>

      {/* Question card skeletons */}
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/40 bg-surface px-4 py-3.5 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-border/30 rounded shrink-0" />
              <div className="h-4 flex-1 bg-border/30 rounded max-w-sm" />
              <div className="h-5 w-16 bg-border/20 rounded-full hidden sm:block" />
              <div className="h-5 w-12 bg-border/20 rounded-full" />
              <div className="h-4 w-4 bg-border/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <BackToDashboard />
      <Suspense fallback={<PracticePageSkeleton />}>
        <PracticeClient companies={COMPANIES} />
      </Suspense>
    </main>
  );
}
