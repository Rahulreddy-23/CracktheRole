"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Sparkles,
  Brain,
  FileText,
  BarChart3,
  Code2,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING } from "@/config/constants";
import { cn } from "@/lib/utils";

// ── Shared animation variants ─────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const staggerFast = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function SectionWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Animated gradient mesh background */}
      <div className="hero-mesh absolute inset-0" />
      {/* Dot grid overlay */}
      <div className="dot-grid absolute inset-0" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-4 max-w-5xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium glass border border-primary/30 text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Interview Prep
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp}
          className="text-5xl md:text-7xl font-bold text-foreground leading-[1.08] tracking-tight mb-6"
        >
          Crack Your Dream
          <br />
          <span className="text-gradient">Tech Role</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={fadeUp}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Practice mock interviews with AI, build stunning resumes, and execute
          real code — all in one platform built for Indian engineers.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <Link href="/signup">
            <Button size="lg" className="glow-blue h-12 px-8 text-base gap-2">
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border">
              How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Trust logos */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground/50 uppercase tracking-widest">
            Trusted by engineers at
          </p>
          <div className="flex items-center gap-6 md:gap-10">
            {["Google", "Microsoft", "Amazon", "Flipkart", "Razorpay"].map((co) => (
              <span
                key={co}
                className="text-sm font-semibold text-muted-foreground/25 select-none"
              >
                {co}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* App mockup */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl mx-auto px-4 mt-16"
      >
        {/* Browser frame */}
        <div className="rounded-2xl border border-white/10 overflow-hidden glass-strong shadow-2xl">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-400/60" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white/5 rounded-md px-3 py-1 text-xs text-muted-foreground/60 text-center max-w-xs mx-auto">
                cracktherole.com/interview/session
              </div>
            </div>
          </div>
          {/* Mockup content */}
          <div className="bg-[hsl(240_10%_5%)] p-0 grid grid-cols-1 md:grid-cols-5 min-h-[300px] md:min-h-[380px]">
            {/* Problem panel */}
            <div className="md:col-span-2 p-5 border-r border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">Easy</span>
                <span className="text-xs text-muted-foreground">Arrays & Hashing</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Two Sum</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Given an array of integers{" "}
                <code className="text-primary bg-primary/10 px-1 rounded">nums</code> and an integer{" "}
                <code className="text-primary bg-primary/10 px-1 rounded">target</code>, return indices of the two numbers that add up to target.
              </p>
              <div className="space-y-2">
                <div className="bg-white/5 rounded-md p-2 text-xs font-mono text-muted-foreground">
                  <span className="text-blue-400">Input:</span> nums = [2,7,11,15], target = 9
                </div>
                <div className="bg-white/5 rounded-md p-2 text-xs font-mono text-muted-foreground">
                  <span className="text-green-400">Output:</span> [0, 1]
                </div>
              </div>
            </div>
            {/* Code editor panel */}
            <div className="md:col-span-3 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-mono">solution.py</span>
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">● Running</span>
              </div>
              <div className="font-mono text-xs space-y-1 text-muted-foreground">
                <div><span className="text-blue-400">def</span> <span className="text-yellow-300">twoSum</span><span className="text-foreground">(nums, target):</span></div>
                <div className="pl-4"><span className="text-blue-400">seen</span> <span className="text-foreground">= {"{}"}</span></div>
                <div className="pl-4"><span className="text-purple-400">for</span> <span className="text-foreground">i, n</span> <span className="text-purple-400">in</span> <span className="text-yellow-300">enumerate</span><span className="text-foreground">(nums):</span></div>
                <div className="pl-8"><span className="text-blue-400">diff</span> <span className="text-foreground">= target - n</span></div>
                <div className="pl-8 bg-primary/5 rounded"><span className="text-purple-400">if</span> <span className="text-foreground">diff</span> <span className="text-purple-400">in</span> <span className="text-blue-400">seen</span><span className="text-foreground">:</span></div>
                <div className="pl-12"><span className="text-purple-400">return</span> <span className="text-foreground">[seen[diff], i]</span></div>
                <div className="pl-8"><span className="text-blue-400">seen</span><span className="text-foreground">[n] = i</span></div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Correct! O(n) time complexity. Great use of hash map!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .hero-mesh {
          background:
            radial-gradient(ellipse 80% 70% at 10% 40%, rgba(59,130,246,0.15) 0%, transparent 55%),
            radial-gradient(ellipse 60% 60% at 90% 10%, rgba(139,92,246,0.12) 0%, transparent 50%),
            radial-gradient(ellipse 70% 80% at 50% 100%, rgba(6,182,212,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 80% 80%, rgba(59,130,246,0.08) 0%, transparent 50%),
            hsl(240 10% 3.9%);
          animation: heroMesh 16s ease-in-out infinite alternate;
        }
        @keyframes heroMesh {
          0%   { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(15deg); }
        }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }
      `}</style>
    </section>
  );
}

// ── FEATURES ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Brain,
    title: "AI Mock Interviews",
    description:
      "Get AI-generated problems tailored to your target company and role. Real-time chat coaching, in-browser code execution, and instant detailed feedback on every solution.",
    accent: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    glow: "hover:shadow-blue-500/10",
  },
  {
    icon: FileText,
    title: "Smart Resume Builder",
    description:
      "Paste a job description and let AI tailor your resume for maximum ATS score. Or build from scratch with AI-generated bullet points for every role and project.",
    accent: "from-cyan-500/20 to-cyan-600/5",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    glow: "hover:shadow-cyan-500/10",
  },
  {
    icon: BarChart3,
    title: "Interview Analytics",
    description:
      "Track your progress over every session. Review AI scoring across 5 dimensions, study your mistake logs, and identify the exact areas to improve before your real interview.",
    accent: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    glow: "hover:shadow-purple-500/10",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionWrapper className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Features
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-foreground">
            Everything you need to
            <br />
            <span className="text-gradient">ace your interview</span>
          </motion.h2>
        </SectionWrapper>

        <SectionWrapper className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, iconColor, iconBg, glow }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className={cn(
                "glass rounded-2xl p-8 border border-white/8 transition-all duration-300 hover:border-white/15",
                "shadow-xl hover:shadow-2xl",
                glow
              )}
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-5", iconBg)}>
                <Icon className={cn("w-6 h-6", iconColor)} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </SectionWrapper>
      </div>
    </section>
  );
}

// ── HOW IT WORKS ──────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    title: "Choose Your Challenge",
    description:
      "Select your interview type (coding, system design, or behavioral), pick a topic, set the difficulty, and choose your programming language.",
    icon: Code2,
  },
  {
    num: "02",
    title: "Code & Discuss",
    description:
      "Solve the problem in a full Monaco code editor with syntax highlighting. Run your code against test cases. Chat with the AI coach for hints without spoilers.",
    icon: Zap,
  },
  {
    num: "03",
    title: "Get Feedback",
    description:
      "Receive a detailed scorecard across 5 dimensions: problem solving, code quality, communication, time complexity, and edge cases.",
    icon: BarChart3,
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 px-4 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionWrapper className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            How It Works
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-foreground">
            From zero to{" "}
            <span className="text-gradient">offer letter</span>
          </motion.h2>
        </SectionWrapper>

        <SectionWrapper className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px border-t-2 border-dashed border-border z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative z-10">
            {STEPS.map(({ num, title, description, icon: Icon }) => (
              <motion.div key={num} variants={fadeUp} className="flex flex-col items-center text-center">
                {/* Number badge */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 relative">
                  <Icon className="w-7 h-7 text-primary" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {num.replace("0", "")}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{description}</p>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}

// ── PRICING ───────────────────────────────────────────────────────────────

function PricingSection() {
  const cards = [
    {
      label: PRICING.free.name,
      price: "Free",
      priceNote: null,
      features: PRICING.free.features,
      cta: "Get Started",
      ctaVariant: "outline" as const,
      href: "/signup",
      highlight: false,
      badge: null,
    },
    {
      label: PRICING.starterPack.name,
      price: `Rs. ${PRICING.starterPack.basePrice}`,
      priceNote: "+ GST",
      features: [PRICING.starterPack.description],
      cta: "Buy Now",
      ctaVariant: "secondary" as const,
      href: "/signup",
      highlight: false,
      badge: "One-time",
    },
    {
      label: PRICING.interviewPack.name,
      price: `Rs. ${PRICING.interviewPack.basePrice}`,
      priceNote: "+ GST",
      features: [PRICING.interviewPack.description],
      cta: "Buy Now",
      ctaVariant: "secondary" as const,
      href: "/signup",
      highlight: false,
      badge: "One-time",
    },
    {
      label: PRICING.pro.name,
      price: `Rs. ${PRICING.pro.basePrice}`,
      priceNote: "/mo + GST",
      features: [...PRICING.pro.features],
      cta: "Go Pro",
      ctaVariant: "default" as const,
      href: "/signup",
      highlight: true,
      badge: "Popular",
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionWrapper className="text-center mb-6">
          <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Pricing
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Simple, transparent{" "}
            <span className="text-gradient">pricing</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm text-muted-foreground">
            All prices are exclusive of 18% GST
          </motion.p>
        </SectionWrapper>

        <SectionWrapper className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-12">
          {cards.map(({ label, price, priceNote, features, cta, ctaVariant, href, highlight, badge }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col",
                highlight
                  ? "border-primary/40 bg-primary/5 shadow-2xl shadow-primary/10 glow-blue scale-[1.03]"
                  : "border-border glass"
              )}
            >
              {badge && (
                <span className={cn(
                  "absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full",
                  highlight
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground border border-border"
                )}>
                  {badge}
                </span>
              )}

              <div className="mb-5">
                <p className="text-sm font-semibold text-muted-foreground mb-2">{label}</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-foreground">{price}</span>
                  {priceNote && (
                    <span className="text-xs text-muted-foreground mb-1">{priceNote}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className={cn("w-4 h-4 mt-0.5 shrink-0", highlight ? "text-primary" : "text-muted-foreground")} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={href}>
                <Button
                  variant={ctaVariant}
                  className={cn("w-full", highlight && "glow-blue")}
                >
                  {cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </SectionWrapper>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="py-24 md:py-32 px-4 relative overflow-hidden">
      <div className="cta-mesh absolute inset-0" />
      <div className="dot-grid-cta absolute inset-0 opacity-40" />

      <SectionWrapper className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-foreground mb-6">
          Ready to crack your{" "}
          <span className="text-gradient">next interview?</span>
        </motion.h2>
        <motion.p variants={fadeUp} className="text-muted-foreground mb-8 text-lg">
          Join thousands of engineers who&apos;ve landed offers at top companies.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="glow-blue-lg h-14 px-10 text-lg gap-2">
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
        <motion.p variants={fadeUp} className="text-xs text-muted-foreground mt-4">
          No credit card required · Free plan available
        </motion.p>
      </SectionWrapper>

      <style>{`
        .cta-mesh {
          background:
            radial-gradient(ellipse 80% 80% at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 20% 80%, rgba(139,92,246,0.08) 0%, transparent 50%),
            hsl(240 10% 3.9%);
        }
        .dot-grid-cta {
          background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>
    </section>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
    </>
  );
}
