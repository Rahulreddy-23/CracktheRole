"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Zap, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { signOutUser } from "@/lib/auth";

// ── Breadcrumb map ────────────────────────────────────────────────────────

const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/interview": "Mock Interview",
  "/resume": "Resume Builder",
  "/history": "Interview History",
  "/settings": "Settings",
};

function getBreadcrumb(pathname: string): string {
  // Exact match first
  if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname];
  // Prefix match (e.g. /interview/abc123)
  const match = Object.entries(BREADCRUMBS).find(([key]) => pathname.startsWith(key + "/"));
  return match ? match[1] : "CrackTheRole";
}

// ── Topbar component ──────────────────────────────────────────────────────

interface TopbarProps {
  onMobileMenuOpen: () => void;
}

export default function Topbar({ onMobileMenuOpen }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const isPro = userProfile?.plan === "pro";

  const breadcrumb = getBreadcrumb(pathname);

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  async function handleLogout() {
    await signOutUser();
    router.replace("/login");
  }

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background shrink-0 sticky top-0 z-30">
      {/* ── Left ── */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuOpen}
          className={cn(
            "md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          )}
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden md:inline">CrackTheRole</span>
          <span className="text-muted-foreground hidden md:inline text-sm">/</span>
          <span className="font-semibold text-sm text-foreground">{breadcrumb}</span>
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-2">
        {/* Upgrade button — free plan only */}
        {!isPro && (
          <Link href="/settings">
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:flex items-center gap-1.5 h-8 text-xs border-primary/40 text-primary hover:bg-primary/10"
            >
              <Zap className="w-3.5 h-3.5" />
              Upgrade
            </Button>
          </Link>
        )}

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.photoURL ?? ""} />
                <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.displayName ?? "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
