import { Skeleton } from "@/components/ui/skeleton";

export default function InterviewSessionLoading() {
    return (
        <main className="h-screen bg-background flex flex-col overflow-hidden">
            {/* Top bar skeleton */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-surface/50 shrink-0">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-16 rounded" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
            </div>

            {/* Split panel skeleton */}
            <div className="flex-1 flex min-h-0">
                {/* Chat panel skeleton */}
                <div className="w-full lg:w-[60%] flex flex-col border-r border-border/40">
                    <div className="flex-1 p-4 space-y-4">
                        {/* AI message skeleton */}
                        <div className="flex gap-3 max-w-[80%]">
                            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                        {/* User message skeleton */}
                        <div className="flex gap-3 max-w-[70%] ml-auto">
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                        {/* Another AI message */}
                        <div className="flex gap-3 max-w-[80%]">
                            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                        </div>
                    </div>
                    {/* Input area skeleton */}
                    <div className="p-4 border-t border-border/40">
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                </div>

                {/* Editor panel skeleton */}
                <div className="hidden lg:flex lg:w-[40%] flex-col">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-7 w-28 rounded" />
                    </div>
                    <div className="flex-1 p-4 space-y-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-4"
                                style={{ width: `${30 + Math.random() * 60}%` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
