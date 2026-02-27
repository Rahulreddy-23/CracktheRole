"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Flipkart",
  "Razorpay",
  "PhonePe",
  "Uber",
  "Swiggy",
  "Zepto",
];

// Duplicate for seamless marquee loop
const COMPANIES_TICKER = [...COMPANIES, ...COMPANIES];

const HEADLINE_WORDS = [
  "Crack",
  "Your",
  "Dream",
  "Role",
  "at",
  "MAANG",
  "Companies",
];

const containerVariants: import("framer-motion").Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.6,
    },
  },
};

const wordVariants: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeUp: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Gradient fade at bottom of dot grid */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-background to-transparent pointer-events-none" />

      {/* Floating ambient orbs */}
      <motion.div
        className="absolute top-[-10%] left-[-5%] w-175 h-175 rounded-full pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(circle, rgba(108,60,225,0.22) 0%, transparent 65%)",
        }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-5%] right-[-8%] w-200 h-200 rounded-full pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 65%)",
        }}
        animate={{ x: [0, -40, 0], y: [0, -25, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[30%] right-[15%] w-100 h-100 rounded-full pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)",
        }}
        animate={{ x: [0, -25, 0], y: [0, 35, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Hero content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-primary/35 bg-brand-primary/8 text-sm text-brand-primary-light font-medium">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary" />
            </span>
            Built for India&apos;s 40LPA+ Job Market
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </div>
        </motion.div>

        {/* Headline with per-word stagger */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6 max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-label="Crack Your Dream Role at MAANG Companies"
        >
          {HEADLINE_WORDS.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className={`inline-block mr-[0.25em] ${
                word === "MAANG" || word === "Companies"
                  ? "bg-linear-to-r from-brand-primary-light to-brand-secondary bg-clip-text text-transparent"
                  : "text-text-primary"
              }`}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          custom={0.95}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed mb-10"
        >
          AI-powered mock interviews, company-specific prep, and salary
          intelligence &mdash; everything you need to land a 40LPA+ offer.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          custom={1.1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center gap-3 mb-4"
        >
          <Button
            asChild
            size="lg"
            className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-xl shadow-brand-primary/30 font-medium px-7 h-12 text-[15px] group"
          >
            <Link href="/login">
              Start Free Practice
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border/60 text-text-secondary hover:text-text-primary hover:border-border hover:bg-surface/50 font-medium px-7 h-12 text-[15px] group bg-transparent"
          >
            <a href="#how-it-works">
              <Play className="mr-2 w-3.5 h-3.5 fill-current opacity-80 group-hover:opacity-100 transition-opacity" />
              See How It Works
            </a>
          </Button>
        </motion.div>

        {/* Fine print */}
        <motion.p
          custom={1.25}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-sm text-text-secondary/55 mb-16"
        >
          No credit card required. 3 free interviews per week.
        </motion.p>

        {/* Company logos ticker */}
        <motion.div
          custom={1.4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-text-secondary/40 mb-5">
            Prep for roles at
          </p>
          <div className="relative overflow-hidden w-full max-w-3xl mx-auto">
            {/* Edge fades */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="flex animate-marquee gap-10 whitespace-nowrap w-max">
              {COMPANIES_TICKER.map((company, i) => (
                <span
                  key={`${company}-${i}`}
                  className="text-sm font-semibold text-text-secondary/30 hover:text-text-secondary/55 transition-colors duration-300 cursor-default select-none tracking-wide"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-border/40 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-text-secondary/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
