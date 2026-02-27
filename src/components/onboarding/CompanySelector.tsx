"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const COMPANIES = [
    "Google",
    "Amazon",
    "Microsoft",
    "Meta",
    "Apple",
    "Flipkart",
    "Razorpay",
    "PhonePe",
    "Swiggy",
    "Zomato",
    "Uber",
    "Ola",
    "Zerodha",
    "CRED",
    "Meesho",
    "Atlassian",
    "Intuit",
    "Goldman Sachs",
    "Morgan Stanley",
    "Adobe",
    "Salesforce",
    "Oracle",
    "Others",
];

const cardVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: (i: number) => ({
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1],
            delay: i * 0.025,
        },
    }),
};

interface CompanySelectorProps {
    selectedCompanies: string[];
    onToggle: (company: string) => void;
}

export default function CompanySelector({
    selectedCompanies,
    onToggle,
}: CompanySelectorProps) {
    const count = selectedCompanies.length;

    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center mb-2">
                Which companies are you targeting?
            </h2>
            <p className="text-text-secondary text-center mb-2 text-sm">
                Select up to 5 companies you want to prepare for.
            </p>

            {/* Counter */}
            <p className="text-center mb-6">
                <span
                    className={`text-sm font-semibold ${count > 5 ? "text-brand-danger" : "text-brand-primary-light"
                        }`}
                >
                    {count}/5
                </span>
                <span className="text-text-secondary text-sm"> selected</span>
            </p>

            {/* Company grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {COMPANIES.map((company, i) => {
                    const isSelected = selectedCompanies.includes(company);
                    const isDisabled = !isSelected && count >= 5;

                    return (
                        <motion.button
                            key={company}
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileTap={{ scale: 0.96 }}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => onToggle(company)}
                            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${isSelected
                                    ? "border-brand-primary/60 bg-brand-primary/10"
                                    : isDisabled
                                        ? "border-border/30 bg-surface/30 opacity-40 cursor-not-allowed"
                                        : "border-border/50 bg-surface hover:border-border hover:bg-surface2 cursor-pointer"
                                }`}
                        >
                            {/* Checkbox indicator */}
                            <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${isSelected
                                        ? "bg-brand-primary border-brand-primary"
                                        : "border-border/60 bg-transparent"
                                    }`}
                            >
                                {isSelected && (
                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                            </div>

                            <span
                                className={`text-sm font-medium truncate transition-colors duration-200 ${isSelected ? "text-text-primary" : "text-text-secondary"
                                    }`}
                            >
                                {company}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
