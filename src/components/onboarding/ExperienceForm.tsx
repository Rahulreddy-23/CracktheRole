"use client";

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ExperienceData {
    currentCtc: number;
    targetCtc: number;
    experienceYears: string;
    prepTimeline: string;
}

interface ExperienceFormProps {
    data: ExperienceData;
    onChange: (data: ExperienceData) => void;
    ctcError: string;
}

const containerVariants: import("framer-motion").Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
};

const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
};

export default function ExperienceForm({
    data,
    onChange,
    ctcError,
}: ExperienceFormProps) {
    const update = (partial: Partial<ExperienceData>) => {
        onChange({ ...data, ...partial });
    };

    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center mb-2">
                Tell us about your experience
            </h2>
            <p className="text-text-secondary text-center mb-8 text-sm">
                This helps us personalize your preparation plan.
            </p>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-6 max-w-md mx-auto"
            >
                {/* Current CTC */}
                <motion.div variants={itemVariants}>
                    <Label className="text-text-secondary text-sm mb-2 block">
                        Current CTC (LPA)
                    </Label>
                    <div className="flex items-center gap-3">
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={data.currentCtc === 0 ? "" : data.currentCtc}
                            onChange={(e) =>
                                update({ currentCtc: e.target.value === "" ? 0 : Number(e.target.value) })
                            }
                            placeholder="e.g. 12"
                            className="bg-surface border-border/60 text-text-primary h-11 flex-1"
                        />
                        <span className="text-text-secondary text-sm font-medium shrink-0 w-10">
                            LPA
                        </span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={data.currentCtc}
                        onChange={(e) =>
                            update({ currentCtc: Number(e.target.value) })
                        }
                        className="w-full mt-2 accent-brand-primary h-1.5 cursor-pointer"
                    />
                </motion.div>

                {/* Target CTC */}
                <motion.div variants={itemVariants}>
                    <Label className="text-text-secondary text-sm mb-2 block">
                        Target CTC (LPA)
                    </Label>
                    <div className="flex items-center gap-3">
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={data.targetCtc === 0 ? "" : data.targetCtc}
                            onChange={(e) =>
                                update({ targetCtc: e.target.value === "" ? 0 : Number(e.target.value) })
                            }
                            placeholder="e.g. 40"
                            className={`bg-surface border-border/60 text-text-primary h-11 flex-1 ${ctcError ? "border-brand-danger" : ""
                                }`}
                        />
                        <span className="text-text-secondary text-sm font-medium shrink-0 w-10">
                            LPA
                        </span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={data.targetCtc}
                        onChange={(e) =>
                            update({ targetCtc: Number(e.target.value) })
                        }
                        className="w-full mt-2 accent-brand-primary h-1.5 cursor-pointer"
                    />
                    {ctcError && (
                        <p className="text-brand-danger text-xs mt-1.5">{ctcError}</p>
                    )}
                </motion.div>

                {/* Years of Experience */}
                <motion.div variants={itemVariants}>
                    <Label className="text-text-secondary text-sm mb-2 block">
                        Years of Experience
                    </Label>
                    <Select
                        value={data.experienceYears}
                        onValueChange={(val) => update({ experienceYears: val })}
                    >
                        <SelectTrigger className="bg-surface border-border/60 text-text-primary h-11 w-full">
                            <SelectValue placeholder="Select experience range" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface border-border/60">
                            <SelectItem value="0-1">0 - 1 years</SelectItem>
                            <SelectItem value="1-3">1 - 3 years</SelectItem>
                            <SelectItem value="3-5">3 - 5 years</SelectItem>
                            <SelectItem value="5-8">5 - 8 years</SelectItem>
                            <SelectItem value="8+">8+ years</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>

                {/* Prep Timeline */}
                <motion.div variants={itemVariants}>
                    <Label className="text-text-secondary text-sm mb-2 block">
                        Preparation Timeline
                    </Label>
                    <Select
                        value={data.prepTimeline}
                        onValueChange={(val) => update({ prepTimeline: val })}
                    >
                        <SelectTrigger className="bg-surface border-border/60 text-text-primary h-11 w-full">
                            <SelectValue placeholder="Choose your timeline" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface border-border/60">
                            <SelectItem value="1_month">1 month</SelectItem>
                            <SelectItem value="3_months">3 months</SelectItem>
                            <SelectItem value="6_months">6 months</SelectItem>
                            <SelectItem value="12_months">12 months</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>
            </motion.div>
        </div>
    );
}
