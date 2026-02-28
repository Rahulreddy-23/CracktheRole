"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    const isDev = process.env.NODE_ENV === "development";

    return (
        <main className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-brand-danger/10 border border-brand-danger/20 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-brand-danger" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                    Something went wrong
                </h1>
                <p className="text-sm text-text-secondary mb-6">
                    An unexpected error occurred. Please try again or return to the
                    dashboard.
                </p>

                {/* Error details in development */}
                {isDev && error?.message && (
                    <div className="mb-6 rounded-lg bg-surface border border-border/50 p-4 text-left">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">
                            Error Details
                        </p>
                        <p className="text-sm text-brand-danger font-mono break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-text-secondary/60 font-mono mt-1">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                        onClick={reset}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 gap-2 w-full sm:w-auto"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="border-border/50 text-text-secondary hover:text-text-primary hover:bg-surface2 gap-2 w-full sm:w-auto"
                    >
                        <Link href="/dashboard">
                            <LayoutDashboard className="w-4 h-4" />
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
