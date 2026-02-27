"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  Building2,
  Code2,
  IndianRupee,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor: string;
}

const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: "AI Mock Interviews",
    description:
      "Practice with an AI interviewer that adapts to your level. Get scored on technical accuracy, communication, and problem-solving in real time.",
    accentColor: "rgba(108,60,225,0.15)",
  },
  {
    icon: Building2,
    title: "Company-Specific Prep",
    description:
      "Questions tagged by exact company and round. Know what Google Bangalore asks differently from Amazon Hyderabad.",
    accentColor: "rgba(6,182,212,0.12)",
  },
  {
    icon: Code2,
    title: "Real-Time Code Editor",
    description:
      "Built-in Monaco editor for DSA and SQL questions. Write, test, and discuss your solution with the AI interviewer.",
    accentColor: "rgba(139,92,246,0.12)",
  },
  {
    icon: BarChart3,
    title: "Detailed Scorecards",
    description:
      "After every interview, get a breakdown of your strengths, weaknesses, and specific improvement suggestions with actionable next steps.",
    accentColor: "rgba(16,185,129,0.12)",
  },
  {
    icon: IndianRupee,
    title: "Salary Intelligence",
    description:
      "See real, anonymized salary data from Indian tech companies. Know your worth before you negotiate your next offer.",
    accentColor: "rgba(245,158,11,0.12)",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Visualize your improvement over time. Daily streaks, weekly reports, and percentile rankings against your peers.",
    accentColor: "rgba(6,182,212,0.12)",
  },
];

const sectionVariants: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const gridVariants: import("framer-motion").Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -6,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      className="relative group rounded-2xl border border-border/50 bg-surface p-6 cursor-default overflow-hidden"
    >
      {/* Hover top-edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-brand-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Hover background accent */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at top left, ${feature.accentColor}, transparent 60%)`,
        }}
      />

      {/* Icon */}
      <div
        className="relative z-10 w-11 h-11 rounded-xl flex items-center justify-center mb-5 border border-border/60 group-hover:border-brand-primary/30 transition-colors duration-300"
        style={{ background: feature.accentColor }}
      >
        <Icon className="w-5 h-5 text-text-primary" strokeWidth={1.75} />
      </div>

      {/* Content */}
      <h3 className="relative z-10 text-base font-semibold text-text-primary mb-2 group-hover:text-white transition-colors duration-200">
        {feature.title}
      </h3>
      <p className="relative z-10 text-sm text-text-secondary leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-28 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Heading */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary-light mb-4">
            What we offer
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight mb-4">
            Everything You Need to{" "}
            <span className="bg-linear-to-r from-brand-primary-light to-brand-secondary bg-clip-text text-transparent">
              Crack the Interview
            </span>
          </h2>
          <p className="text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
            Six core capabilities, working together to take you from first
            practice to signed offer letter.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
