import { Skeleton } from "@/components/ui/skeleton";

export default function PracticeLoading() {
    return (
        <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Heading skeleton */}
            <div className="mb-6">
                <Skeleton className="h-7 w-44 mb-1.5" />
                <Skeleton className="h-4 w-32" />
            </div>

            {/* Filter bar skeleton */}
            <div className="space-y-3 mb-6">
                <Skeleton className="h-10 w-full rounded-lg" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-64 rounded-lg" />
                    <Skeleton className="h-8 w-48 rounded-lg" />
                    <Skeleton className="h-8 w-36 rounded-lg ml-auto" />
                </div>
            </div>

            {/* Question card skeletons */}
            <div className="space-y-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-border/40 bg-surface px-4 py-3.5"
                    >
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-4 h-4 rounded shrink-0" />
                            <Skeleton className="h-4 flex-1 max-w-sm" />
                            <Skeleton className="h-5 w-16 rounded-full hidden sm:block" />
                            <Skeleton className="h-5 w-12 rounded-full" />
                            <Skeleton className="h-4 w-4 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
