import type { Metadata } from "next";
import { Suspense } from "react";
import PracticeClient from "@/components/practice/PracticeClient";
import BackToDashboard from "@/components/shared/BackToDashboard";

export const metadata: Metadata = {
  title: "Problem Bank — CracktheRole",
  description:
    "Practice DSA, system design, behavioral, and SQL problems tagged by company and difficulty.",
};

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <BackToDashboard />
      <Suspense fallback={<PracticePageSkeleton />}>
        <PracticeClient companies={[]} />
      </Suspense>
    </main>
  );
}

function PracticePageSkeleton() {
  return (
    <div className="space-y-4 mt-6">
      <div className="h-7 w-44 bg-border/30 rounded-lg animate-pulse" />
      <div className="h-10 w-full bg-border/20 rounded-xl animate-pulse" />
      <div className="flex gap-2">
        <div className="h-8 w-64 bg-border/20 rounded-lg animate-pulse" />
        <div className="h-8 w-48 bg-border/20 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-lg bg-surface/60 animate-pulse border border-border/20"
          />
        ))}
      </div>
    </div>
  );
}
