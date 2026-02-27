"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/30 group-hover:shadow-brand-primary/50 transition-shadow duration-300">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[17px] bg-linear-to-r from-white to-brand-primary-light bg-clip-text text-transparent">
            CracktheRole
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button
            asChild
            className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md shadow-brand-primary/25 font-medium h-9 px-4 text-sm"
          >
            <Link href="/login">Start Preparing</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors rounded-md hover:bg-surface"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-surface border-border w-72 p-0"
          >
            <SheetHeader className="p-6 pb-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Link
                href="/"
                className="flex items-center gap-2.5 w-fit"
                onClick={() => setSheetOpen(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-[17px] text-text-primary">
                  CracktheRole
                </span>
              </Link>
            </SheetHeader>

            <div className="flex flex-col p-6 pt-8 gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setSheetOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface2 rounded-lg transition-colors duration-150"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 mt-2 border-t border-border">
                <Button
                  asChild
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
                >
                  <Link href="/login" onClick={() => setSheetOpen(false)}>
                    Start Preparing
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.nav>
  );
}
