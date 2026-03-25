import Link from "next/link";
import { FileQuestion, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 large text */}
        <div className="space-y-1">
          <p className="text-8xl font-black text-gradient leading-none">404</p>
          <div className="flex justify-center mt-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <FileQuestion className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            CrackTheRole
          </p>
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Head back to the dashboard to continue practising.
          </p>
        </div>

        {/* Action */}
        <Button asChild className="gap-2">
          <Link href="/dashboard">
            <LayoutDashboard className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
