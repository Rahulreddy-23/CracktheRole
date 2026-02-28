import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-6">
                {/* Welcome banner skeleton */}
                <div className="rounded-2xl border border-border/30 bg-surface/40 p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-7 w-56 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-10 w-28 rounded-lg" />
                    </div>
                </div>

                {/* Stats row skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-border/30 bg-surface/40 p-5"
                        >
                            <Skeleton className="w-9 h-9 rounded-lg mb-3" />
                            <Skeleton className="h-3 w-24 mb-2" />
                            <Skeleton className="h-7 w-16 rounded-lg" />
                        </div>
                    ))}
                </div>

                {/* Two-column layout skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
                    <div className="flex flex-col gap-6">
                        <Skeleton className="h-64 rounded-xl" />
                        <Skeleton className="h-32 rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-6">
                        <Skeleton className="h-52 rounded-xl" />
                        <Skeleton className="h-56 rounded-xl" />
                    </div>
                </div>
            </div>
        </main>
    );
}
