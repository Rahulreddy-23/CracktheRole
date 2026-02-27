"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    MessageSquare,
    BookOpen,
    IndianRupee,
    UserCircle,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTIONS = [
    {
        label: "Start Mock Interview",
        href: "/interview/setup",
        icon: MessageSquare,
        variant: "default" as const,
    },
    {
        label: "Browse Questions",
        href: "/practice",
        icon: BookOpen,
        variant: "outline" as const,
    },
    {
        label: "View Salary Data",
        href: "/salary",
        icon: IndianRupee,
        variant: "outline" as const,
    },
    {
        label: "Update Profile",
        href: "/profile",
        icon: UserCircle,
        variant: "ghost" as const,
    },
];

const containerVariants: import("framer-motion").Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.06, delayChildren: 0.2 },
    },
};

const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, x: 12 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
};

export default function QuickActions() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="rounded-xl border border-border/50 bg-surface p-5"
        >
            <h3 className="text-sm font-semibold text-text-primary mb-4">
                Quick Actions
            </h3>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-2"
            >
                {ACTIONS.map((action) => {
                    const Icon = action.icon;
                    const isPrimary = action.variant === "default";

                    return (
                        <motion.div key={action.label} variants={itemVariants}>
                            <Button
                                asChild
                                variant={action.variant}
                                className={`w-full justify-start gap-3 h-10 text-sm font-medium ${isPrimary
                                        ? "bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md shadow-brand-primary/15"
                                        : action.variant === "outline"
                                            ? "border-border/50 text-text-secondary hover:text-text-primary hover:bg-surface2 bg-transparent"
                                            : "text-text-secondary hover:text-text-primary hover:bg-surface2"
                                    }`}
                            >
                                <Link href={action.href}>
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span className="flex-1 text-left">{action.label}</span>
                                    <ArrowRight className="w-3 h-3 opacity-40" />
                                </Link>
                            </Button>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
