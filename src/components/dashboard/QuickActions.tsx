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

const ACTIONS = [
    {
        label: "Start Mock Interview",
        href: "/interview/setup",
        icon: MessageSquare,
        isPrimary: true,
    },
    {
        label: "Browse Questions",
        href: "/practice",
        icon: BookOpen,
        isPrimary: false,
    },
    {
        label: "View Salary Data",
        href: "/salary",
        icon: IndianRupee,
        isPrimary: false,
    },
    {
        label: "Update Profile",
        href: "/profile",
        icon: UserCircle,
        isPrimary: false,
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

                    return (
                        <motion.div key={action.label} variants={itemVariants}>
                            <Link
                                href={action.href}
                                className={`flex items-center gap-3 w-full h-10 px-4 rounded-md text-sm font-medium transition-all duration-200 ${action.isPrimary
                                        ? "bg-brand-primary text-white shadow-md shadow-brand-primary/15 hover:bg-brand-primary/90"
                                        : "bg-transparent border border-border/50 text-text-secondary hover:text-text-primary hover:bg-surface2 hover:border-border"
                                    }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="flex-1 text-left">{action.label}</span>
                                <ArrowRight className="w-3 h-3 opacity-40" />
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
