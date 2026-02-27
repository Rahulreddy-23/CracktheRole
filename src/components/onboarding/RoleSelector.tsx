"use client";

import { motion } from "framer-motion";
import {
    Database,
    Server,
    Layout,
    Brain,
    Cloud,
    Layers,
    type LucideIcon,
} from "lucide-react";

interface Role {
    id: string;
    label: string;
    icon: LucideIcon;
}

const ROLES: Role[] = [
    { id: "data_engineer", label: "Data Engineer", icon: Database },
    { id: "backend_swe", label: "Backend SWE", icon: Server },
    { id: "frontend_swe", label: "Frontend SWE", icon: Layout },
    { id: "ml_engineer", label: "ML Engineer", icon: Brain },
    { id: "devops_sre", label: "DevOps / SRE", icon: Cloud },
    { id: "full_stack", label: "Full Stack", icon: Layers },
];

const cardVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
            delay: i * 0.06,
        },
    }),
};

interface RoleSelectorProps {
    selectedRole: string;
    onSelect: (role: string) => void;
}

export default function RoleSelector({
    selectedRole,
    onSelect,
}: RoleSelectorProps) {
    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center mb-2">
                What role are you preparing for?
            </h2>
            <p className="text-text-secondary text-center mb-8 text-sm">
                Select the role that best matches your career goal.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                {ROLES.map((role, i) => {
                    const isSelected = selectedRole === role.id;
                    const Icon = role.icon;

                    return (
                        <motion.button
                            key={role.id}
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ y: -3, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => onSelect(role.id)}
                            className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border cursor-pointer transition-all duration-300 ${isSelected
                                    ? "border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/15"
                                    : "border-border/50 bg-surface hover:border-border hover:bg-surface2"
                                }`}
                        >
                            {/* Glow effect for selected */}
                            {isSelected && (
                                <motion.div
                                    className="absolute inset-0 rounded-xl border-2 border-brand-primary/50 pointer-events-none"
                                    layoutId="role-selection-ring"
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                />
                            )}

                            <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-300 ${isSelected
                                        ? "bg-brand-primary/20"
                                        : "bg-border/30"
                                    }`}
                            >
                                <Icon
                                    className={`w-5 h-5 transition-colors duration-300 ${isSelected ? "text-brand-primary-light" : "text-text-secondary"
                                        }`}
                                    strokeWidth={1.75}
                                />
                            </div>

                            <span
                                className={`text-sm font-medium transition-colors duration-300 ${isSelected ? "text-text-primary" : "text-text-secondary"
                                    }`}
                            >
                                {role.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
