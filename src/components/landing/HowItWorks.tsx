"use client";

import { motion } from "framer-motion";
import { Compass, MessageSquareCode, Trophy } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    icon: Compass,
    title: "Choose Your Path",
    description:
      "Select your target role and companies. We build a personalized prep plan that focuses on what actually matters for your specific goals.",
  },
  {
    number: "02",
    icon: MessageSquareCode,
    title: "Practice with AI",
    description:
      "Complete mock interviews that feel like the real thing. Get instant, detailed feedback on your answers, communication style, and technical depth.",
  },
  {
    number: "03",
    icon: Trophy,
    title: "Land the Offer",
    description:
      "Track your progress, master your weak areas, and walk into your interview with genuine confidence. Negotiate your offer knowing exactly what you're worth.",
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

interface StepCardProps {
  step: Step;
  index: number;
}

function StepCard({ step, index }: StepCardProps) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.65,
        delay: index * 0.18,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="flex flex-col items-center text-center"
    >
      {/* Step number */}
      <div
        className="text-[88px] font-bold leading-none mb-5 bg-clip-text text-transparent select-none"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(108,60,225,0.55) 0%, rgba(108,60,225,0.04) 100%)",
        }}
        aria-hidden="true"
      >
        {step.number}
      </div>

      {/* Icon circle */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-surface2 border border-border flex items-center justify-center shadow-lg shadow-black/20">
          <Icon
            className="w-7 h-7 text-brand-primary-light"
            strokeWidth={1.75}
          />
        </div>
        {/* Subtle glow */}
        <div className="absolute inset-0 rounded-2xl bg-brand-primary/10 blur-xl -z-10" />
      </div>

      <h3 className="text-xl font-semibold text-text-primary mb-3">
        {step.title}
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
        {step.description}
      </p>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Faint background radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(108,60,225,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto relative">
        {/* Heading */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-20"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary-light mb-4">
            The process
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight mb-4">
            From First Practice to Final Offer
          </h2>
          <p className="text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
            A structured path that takes you from nervous candidate to confident
            offer-holder in weeks, not months.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Animated connector line — desktop only */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.4 }}
            className="hidden md:block absolute top-[110px] left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px origin-left"
            style={{
              background:
                "linear-gradient(to right, rgba(108,60,225,0.15), rgba(108,60,225,0.4), rgba(6,182,212,0.3), rgba(108,60,225,0.15))",
            }}
          />

          {STEPS.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* Bottom CTA nudge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mt-16"
        >
          <a
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary-light hover:text-white transition-colors duration-200 group"
          >
            Start your prep today
            <span className="group-hover:translate-x-0.5 transition-transform duration-200">
              &rarr;
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
