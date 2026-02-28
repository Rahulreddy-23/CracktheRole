import Link from "next/link";
import { Home, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* CSS art compass illustration */}
                <div className="relative w-28 h-28 mx-auto mb-8">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-border/40" />
                    {/* Inner ring */}
                    <div className="absolute inset-3 rounded-full border border-brand-primary/30" />
                    {/* Compass needle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-1 h-20">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[16px] border-l-transparent border-r-transparent border-b-brand-primary" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[16px] border-l-transparent border-r-transparent border-t-text-secondary/30" />
                        </div>
                    </div>
                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-brand-primary shadow-lg shadow-brand-primary/40" />
                    </div>
                    {/* Cardinal directions */}
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-brand-primary">
                        N
                    </span>
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-medium text-text-secondary/40">
                        S
                    </span>
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-text-secondary/40">
                        W
                    </span>
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-text-secondary/40">
                        E
                    </span>
                </div>

                {/* 404 text */}
                <div className="mb-3">
                    <span className="text-6xl font-extrabold bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                        404
                    </span>
                </div>

                <h1 className="text-xl font-bold text-text-primary mb-2">
                    Page Not Found
                </h1>
                <p className="text-sm text-text-secondary mb-8">
                    The page you are looking for does not exist or has been moved.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                        asChild
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 gap-2 w-full sm:w-auto"
                    >
                        <Link href="/">
                            <Home className="w-4 h-4" />
                            Go Home
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="border-border/50 text-text-secondary hover:text-text-primary hover:bg-surface2 gap-2 w-full sm:w-auto"
                    >
                        <Link href="/dashboard">
                            <MapPinOff className="w-4 h-4" />
                            Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
