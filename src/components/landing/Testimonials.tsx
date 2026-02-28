"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  avatarColor: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "CracktheRole's mock interview questions were spot on for my interview at C Data. The AI feedback was super helpful and I cleared the interview in the first attempt. Highly recommend for anyone preparing for a tech interview.",
    name: "Yazhini Krishnan",
    role: "Product Engineer",
    company: "C Data",
    initials: "YK",
    avatarColor: "from-brand-primary to-brand-primary-dark",
    rating: 5,
  },
  {
    quote:
      "The AI feedback is surprisingly honest. It told me I was repeating filler phrases and my solution lacked edge-case thinking. After three weeks of practice, my mock interview scores went from 54 to 87.",
    name: "Rahul Reddy",
    role: "Data Engineer",
    company: "BD",
    initials: "RR",
    avatarColor: "from-brand-secondary to-cyan-700",
    rating: 5,
  },
  {
    quote:
      "As a Product Manager I found theracktheRole's mock interview questions were spot on for my interview at C Data. The AI feedback was super helpful and I cleared the interview in the first attempt. Highly recommend for anyone preparing for a tech interview.",
    name: "Sadhana K",
    role: "Product Manager",
    company: "Morgan Stanley",
    initials: "SK",
    avatarColor: "from-brand-primary to-brand-primary-dark",
    rating: 5,
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

const cardVariants: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      delay,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div
      custom={index * 0.14}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="relative rounded-2xl p-6 sm:p-7 border border-white/6 flex flex-col gap-5 min-w-[min(85vw,320px)] sm:min-w-0 snap-start"
      style={{
        background: "rgba(26, 26, 46, 0.65)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Top highlight */}
      <div className="absolute top-0 left-6 right-6 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

      {/* Stars */}
      <div className="flex gap-1" aria-label={`${testimonial.rating} out of 5 stars`}>
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 text-brand-warning fill-brand-warning"
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-sm text-text-secondary leading-relaxed flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-border/40">
        <div
          className={`w-10 h-10 rounded-full bg-linear-to-br ${testimonial.avatarColor} flex items-center justify-center shrink-0 shadow-md`}
          aria-hidden="true"
        >
          <span className="text-xs font-bold text-white">
            {testimonial.initials}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-tight">
            {testimonial.name}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {testimonial.role} &middot; {testimonial.company}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="container mx-auto">
        {/* Heading */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary-light mb-4">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-text-secondary max-w-lg mx-auto leading-relaxed">
            Real stories from engineers who used CracktheRole to level up their
            careers.
          </p>
        </motion.div>

        {/* Cards — scroll-snap carousel on mobile, grid on desktop */}
        <div
          className="flex gap-5 lg:grid lg:grid-cols-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
          style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
        >
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>

        {/* Mobile scroll indicator */}
        <div className="flex lg:hidden justify-center gap-1.5 mt-5">
          {TESTIMONIALS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${i === 0 ? "w-5 bg-brand-primary" : "w-2 bg-border"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
