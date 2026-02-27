"use client";

import { useEffect, useRef } from "react";
import { motion, animate, useInView } from "framer-motion";

interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  decimals?: number;
}

const STATS: StatItem[] = [
  {
    value: 500,
    suffix: "+",
    label: "Interview Questions",
  },
  {
    value: 50,
    suffix: "+",
    label: "Companies Covered",
  },
  {
    value: 4.8,
    suffix: "/5",
    label: "User Rating",
    decimals: 1,
  },
  {
    value: 35,
    suffix: "%",
    label: "Avg Score Improvement",
  },
];

interface AnimatedNumberProps {
  value: number;
  suffix: string;
  prefix?: string;
  decimals?: number;
}

function AnimatedNumber({
  value,
  suffix,
  prefix = "",
  decimals = 0,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!isInView) return;

    const element = ref.current;
    if (!element) return;

    const controls = animate(0, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate(latest) {
        element.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [isInView, value, suffix, prefix, decimals]);

  return (
    <span ref={ref} suppressHydrationWarning>
      {prefix}0{suffix}
    </span>
  );
}

const sectionVariants: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardVariants: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Stats() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary-light mb-4">
            By the numbers
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Results That Speak for Themselves
          </h2>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="relative rounded-3xl border border-border/50 bg-surface overflow-hidden"
        >
          {/* Inner gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(108,60,225,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Top highlight line */}
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-linear-to-r from-transparent via-brand-primary/30 to-transparent" />

          <div className="relative grid grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center justify-center text-center py-12 px-6 ${
                  index !== STATS.length - 1
                    ? "border-r border-border/50 last:border-r-0"
                    : ""
                } ${index >= 2 ? "border-t border-border/50 lg:border-t-0" : ""}`}
              >
                <div className="text-4xl sm:text-5xl font-bold text-text-primary mb-2 tabular-nums">
                  <AnimatedNumber
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                    decimals={stat.decimals}
                  />
                </div>
                <p className="text-sm text-text-secondary font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-linear-to-r from-transparent via-brand-secondary/20 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
