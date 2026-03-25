"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Code2,
  FileText,
  History,
  Settings,
  LogOut,
  Crown,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { signOutUser } from "@/lib/auth";

// ── Nav items ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Dashboard",        icon: LayoutDashboard },
  { href: "/interview",  label: "Mock Interview",    icon: Code2 },
  { href: "/resume",     label: "Resume Builder",    icon: FileText },
  { href: "/history",    label: "Interview History", icon: History },
  { href: "/settings",   label: "Settings",          icon: Settings },
];

// ── Sidebar component ─────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileContent?: boolean; // When true, render without fixed positioning (for Sheet)
}

export default React.memo(function Sidebar({ collapsed, onToggle, mobileContent = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const isPro = userProfile?.plan === "pro";
  const interviewsUsed = userProfile?.interviewsUsed ?? 0;
  const interviewsLimit = userProfile?.interviewsLimit ?? 1;

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  async function handleLogout() {
    await signOutUser();
    router.replace("/login");
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Logo ── */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border shrink-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-2 overflow-hidden"
        >
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-base text-foreground truncate transition-all duration-300">
              CrackTheRole
            </span>
          )}
        </motion.div>

        {/* Toggle button — only on desktop sidebar */}
        {!mobileContent && (
          <button
            onClick={onToggle}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Tooltip key={href} disableHoverableContent={!collapsed}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                    )}
                    <Icon className="w-5 h-5 shrink-0" />
                    <span
                      className={cn(
                        "truncate transition-all duration-300",
                        collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                      )}
                    >
                      {label}
                    </span>
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="text-xs">
                    {label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* ── Plan indicator ── */}
      <div className="px-3 pb-2">
        {isPro ? (
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 bg-primary/10",
              collapsed && "justify-center"
            )}
          >
            <Crown className="w-4 h-4 text-yellow-400 shrink-0" />
            {!collapsed && (
              <span className="text-xs font-semibold text-primary truncate transition-all duration-300">
                Pro Plan
              </span>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "rounded-lg border border-border bg-sidebar-accent p-3 space-y-2",
              collapsed && "flex justify-center border-none bg-transparent p-1"
            )}
          >
            {!collapsed ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Free Plan</span>
                  <Badge variant="secondary" className="text-[10px] h-4">Free</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {interviewsUsed}/{interviewsLimit} interview{interviewsLimit !== 1 ? "s" : ""} used
                </div>
                <div className="w-full bg-border rounded-full h-1">
                  <div
                    className="bg-primary h-1 rounded-full transition-all"
                    style={{ width: `${Math.min((interviewsUsed / interviewsLimit) * 100, 100)}%` }}
                  />
                </div>
                <Link href="/settings">
                  <Button size="sm" className="w-full h-7 text-xs mt-1">
                    Upgrade
                  </Button>
                </Link>
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/settings">
                    <Zap className="w-4 h-4 text-primary" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">Upgrade Plan</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>

      {/* ── User section ── */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-2",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={user?.photoURL ?? ""} />
            <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden transition-all duration-300">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.displayName ?? "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="flex justify-center w-full mt-1 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Log out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );

  if (mobileContent) return sidebarContent;

  return (
    <aside
      className="hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden"
      style={{
        width: collapsed ? 72 : 260,
        transition: "width 300ms ease",
      }}
    >
      {sidebarContent}
    </aside>
  );
});
