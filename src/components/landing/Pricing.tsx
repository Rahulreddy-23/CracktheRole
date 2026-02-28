"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import WaitlistDialog from "./WaitlistDialog";

// -- Animation variants -------------------------------------------------------

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
        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
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

// -- Data ---------------------------------------------------------------------

interface PlanFeature {
    text: string;
    included: boolean;
}

interface Plan {
    name: string;
    price: string;
    badge?: string;
    highlighted?: boolean;
    features: PlanFeature[];
    cta: string;
    ctaVariant: "outline" | "default";
    href?: string;
}

const PLANS: Plan[] = [
    {
        name: "Free",
        price: "0 INR / forever",
        features: [
            { text: "3 mock interviews per week", included: true },
            { text: "Basic feedback and scoring", included: true },
            { text: "50 practice questions", included: true },
            { text: "Company-specific questions", included: false },
            { text: "Detailed scorecards", included: false },
        ],
        cta: "Get Started Free",
        ctaVariant: "outline",
        href: "/login",
    },
    {
        name: "Pro (Monthly)",
        price: "499 INR / month",
        badge: "Most Popular",
        highlighted: true,
        features: [
            { text: "Unlimited mock interviews", included: true },
            { text: "Company-specific prep for 50+ companies", included: true },
            { text: "Full detailed scorecards", included: true },
            { text: "500+ practice questions", included: true },
        ],
        cta: "Upgrade to Pro",
        ctaVariant: "default",
    },
    {
        name: "Pro (Yearly)",
        price: "3,999 INR / year",
        badge: "Best Value",
        features: [
            { text: "All Pro Monthly features", included: true },
            { text: "Save over 30% annually", included: true },
            { text: "Priority new content access", included: true },
            { text: "Exclusive webinars", included: true },
            { text: "1-on-1 career consultation (1x/yr)", included: true },
        ],
        cta: "Get Annual",
        ctaVariant: "default",
    },
    {
        name: "Resume Review",
        price: "499 INR / one-time",
        features: [
            { text: "Comprehensive ATS check", included: true },
            { text: "Action-verb optimization", included: true },
            { text: "Format & design feedback", included: true },
            { text: "Industry keyword targeting", included: true },
            { text: "Delivered in 48 hours", included: true },
        ],
        cta: "Buy Review",
        ctaVariant: "outline",
    },
    {
        name: "Mock Interview",
        price: "1,499 INR / one-time",
        features: [
            { text: "1-on-1 with FAANG Engineer", included: true },
            { text: "60-minute technical session", included: true },
            { text: "Actionable written feedback", included: true },
            { text: "Recorded session (optional)", included: true },
            { text: "Customized question set", included: true },
        ],
        cta: "Book Interview",
        ctaVariant: "outline",
    },
];

// -- Component ----------------------------------------------------------------

export default function Pricing() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState("Pro");

    const handlePaidClick = (tier: string) => {
        toast("Payments launching soon! Join the waitlist.", { icon: "\u{1F680}" });
        setSelectedTier(tier);
        setDialogOpen(true);
    };

    return (
        <>
            <section id="pricing" className="py-28 px-4 sm:px-6 lg:px-8">
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
                            Pricing
                        </p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
                            Start free. Upgrade when you are ready.
                        </p>
                    </motion.div>

                    {/* Cards grid */}
                    <motion.div
                        variants={gridVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-start justify-center"
                    >
                        {PLANS.map((plan) => (
                            <PricingCard
                                key={plan.name}
                                plan={plan}
                                onPaidClick={handlePaidClick}
                            />
                        ))}
                    </motion.div>
                </div>
            </section>

            <WaitlistDialog
                tier={selectedTier}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </>
    );
}

// -- PricingCard --------------------------------------------------------------

interface PricingCardProps {
    plan: Plan;
    onPaidClick: (tier: string) => void;
}

function PricingCard({ plan, onPaidClick }: PricingCardProps) {
    const isHighlighted = plan.highlighted;

    return (
        <motion.div
            variants={cardVariants}
            className={`relative rounded-2xl border p-7 flex flex-col ${isHighlighted
                ? "border-brand-primary/50 bg-surface shadow-2xl shadow-brand-primary/10 md:scale-105 md:-my-4 z-10"
                : "border-border/50 bg-surface"
                }`}
        >
            {/* Animated glow border for highlighted card */}
            {isHighlighted && (
                <div className="absolute -inset-px rounded-2xl animate-glow-border pointer-events-none" />
            )}

            {/* Badge */}
            {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-brand-primary text-white shadow-lg shadow-brand-primary/30">
                        {plan.badge}
                    </span>
                </div>
            )}

            {/* Plan name and price */}
            <div className="mb-6 pt-2">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {plan.name}
                </h3>
                <p className="text-2xl font-bold text-text-primary">{plan.price}</p>
            </div>

            {/* Features */}
            <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3 text-sm">
                        {feature.included ? (
                            <Check className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                        ) : (
                            <X className="w-4 h-4 text-text-secondary/40 shrink-0 mt-0.5" />
                        )}
                        <span
                            className={
                                feature.included
                                    ? "text-text-secondary"
                                    : "text-text-secondary/40"
                            }
                        >
                            {feature.text}
                        </span>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            {plan.href ? (
                <Button
                    asChild
                    variant={plan.ctaVariant}
                    className={`w-full h-11 font-medium ${plan.ctaVariant === "outline"
                        ? "border-border/60 text-text-secondary hover:text-text-primary hover:border-border hover:bg-surface/50 bg-transparent"
                        : ""
                        }`}
                >
                    <Link href={plan.href}>{plan.cta}</Link>
                </Button>
            ) : (
                <Button
                    variant={plan.ctaVariant}
                    className={`w-full h-11 font-medium ${isHighlighted
                        ? "bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/25"
                        : "bg-brand-primary/80 hover:bg-brand-primary/90 text-white"
                        }`}
                    onClick={() => onPaidClick(plan.name)}
                >
                    {plan.cta}
                </Button>
            )}
        </motion.div>
    );
}
