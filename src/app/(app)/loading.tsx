import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar skeleton */}
      <aside className="hidden md:flex w-60 flex-col shrink-0 border-r border-white/8 bg-sidebar p-4 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 py-1.5 mb-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-4 w-28" />
        </div>
        {/* Nav items */}
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
              <Skeleton className="w-4.5 h-4.5 rounded shrink-0" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          ))}
        </div>
        {/* Bottom user section */}
        <div className="mt-auto flex items-center gap-3 px-3 py-2">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar skeleton */}
        <div className="h-14 shrink-0 border-b border-white/8 flex items-center px-6 gap-4">
          <Skeleton className="h-4 w-32 md:hidden" />
          <div className="flex-1" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>

        {/* Page content skeleton */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Page header */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-80" />
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="w-7 h-7 rounded-lg" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>

            {/* Content cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="glass rounded-xl p-6 space-y-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-32 rounded-md" />
                  </div>
                </div>
              ))}
            </div>

            {/* Activity list */}
            <div className="glass rounded-xl overflow-hidden">
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-10 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
