"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import AuthGuard from "@/components/shared/auth-guard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      {/* Skip-to-content link for keyboard / screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-medium focus:outline-none"
      >
        Skip to content
      </a>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* ── Desktop sidebar ── */}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />

        {/* ── Mobile sidebar sheet ── */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-65 bg-sidebar border-r border-sidebar-border">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              mobileContent
            />
          </SheetContent>
        </Sheet>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMobileMenuOpen={() => setMobileOpen(true)} />
          <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
