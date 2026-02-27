"use client";

import { motion } from "framer-motion";

interface StepProgressProps {
    currentStep: number;
    totalSteps: number;
}

export default function StepProgress({
    currentStep,
    totalSteps,
}: StepProgressProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="w-full max-w-md mx-auto mb-8">
            {/* Step counter */}
            <p className="text-sm text-text-secondary text-center mb-3 font-medium">
                Step {currentStep} of {totalSteps}
            </p>

            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-brand-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
                {Array.from({ length: totalSteps }, (_, i) => {
                    const step = i + 1;
                    const isActive = step === currentStep;
                    const isCompleted = step < currentStep;

                    return (
                        <motion.div
                            key={step}
                            className={`rounded-full transition-colors duration-300 ${isActive
                                    ? "w-2.5 h-2.5 bg-brand-primary"
                                    : isCompleted
                                        ? "w-2 h-2 bg-brand-primary/60"
                                        : "w-2 h-2 bg-border"
                                }`}
                            animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
