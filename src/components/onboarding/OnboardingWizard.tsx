"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Rocket, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useUserContext } from "@/components/providers/user-provider";
import StepProgress from "./StepProgress";
import RoleSelector from "./RoleSelector";
import CompanySelector from "./CompanySelector";
import ExperienceForm from "./ExperienceForm";
import PrepPlanPreview from "./PrepPlanPreview";

const TOTAL_STEPS = 4;

// Slide transition variants driven by the direction state
const slideVariants: import("framer-motion").Variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -300 : 300,
        opacity: 0,
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
    }),
};

export default function OnboardingWizard() {
    const router = useRouter();
    const { user } = useUserContext();

    // Step navigation
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);

    // Step 1 - Role
    const [targetRole, setTargetRole] = useState("");

    // Step 2 - Companies
    const [targetCompanies, setTargetCompanies] = useState<string[]>([]);

    // Step 3 - Experience
    const [experience, setExperience] = useState({
        currentCtc: 0,
        targetCtc: 0,
        experienceYears: "",
        prepTimeline: "3_months",
    });
    const [ctcError, setCtcError] = useState("");

    // Saving state
    const [saving, setSaving] = useState(false);

    // -- Company toggle --
    const toggleCompany = useCallback(
        (company: string) => {
            setTargetCompanies((prev) =>
                prev.includes(company)
                    ? prev.filter((c) => c !== company)
                    : prev.length < 5
                        ? [...prev, company]
                        : prev
            );
        },
        []
    );

    // -- Validation per step --
    const validateStep = useCallback((): boolean => {
        if (step === 1) {
            if (!targetRole) {
                toast.error("Please select a target role.");
                return false;
            }
            return true;
        }

        if (step === 2) {
            if (targetCompanies.length === 0) {
                toast.error("Please select at least one company.");
                return false;
            }
            if (targetCompanies.length > 5) {
                toast.error("You can select at most 5 companies.");
                return false;
            }
            return true;
        }

        if (step === 3) {
            if (!experience.experienceYears) {
                toast.error("Please select your years of experience.");
                return false;
            }
            if (
                experience.targetCtc > 0 &&
                experience.currentCtc > 0 &&
                experience.targetCtc <= experience.currentCtc
            ) {
                setCtcError("Target CTC must be greater than current CTC.");
                return false;
            }
            setCtcError("");
            return true;
        }

        return true;
    }, [step, targetRole, targetCompanies, experience]);

    // -- Navigation --
    const goNext = useCallback(() => {
        if (!validateStep()) return;
        setDirection(1);
        setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }, [validateStep]);

    const goBack = useCallback(() => {
        setDirection(-1);
        setStep((s) => Math.max(s - 1, 1));
    }, []);

    // -- Final submit --
    const handleFinish = useCallback(async () => {
        if (!user) return;

        setSaving(true);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("profiles")
                .update({
                    target_role: targetRole,
                    target_companies: targetCompanies,
                    current_ctc: experience.currentCtc,
                    target_ctc: experience.targetCtc,
                    experience_years: parseExperienceYears(experience.experienceYears),
                    prep_timeline: experience.prepTimeline,
                    onboarding_completed: true,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (error) {
                toast.error("Failed to save your preferences. Please try again.");
                return;
            }

            toast.success("Welcome aboard! Let us start preparing.");
            router.push("/dashboard");
            router.refresh();
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    }, [user, targetRole, targetCompanies, experience, router]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top padding and progress */}
            <div className="pt-8 px-4">
                <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} />
            </div>

            {/* Step content */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-2xl">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                        >
                            {step === 1 && (
                                <RoleSelector
                                    selectedRole={targetRole}
                                    onSelect={setTargetRole}
                                />
                            )}
                            {step === 2 && (
                                <CompanySelector
                                    selectedCompanies={targetCompanies}
                                    onToggle={toggleCompany}
                                />
                            )}
                            {step === 3 && (
                                <ExperienceForm
                                    data={experience}
                                    onChange={setExperience}
                                    ctcError={ctcError}
                                />
                            )}
                            {step === 4 && (
                                <PrepPlanPreview
                                    targetRole={targetRole}
                                    targetCompanies={targetCompanies}
                                    currentCtc={experience.currentCtc}
                                    targetCtc={experience.targetCtc}
                                    prepTimeline={experience.prepTimeline}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border/40 px-4 py-4">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {/* Back button */}
                    {step > 1 ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={goBack}
                            className="border-border/60 text-text-secondary hover:text-text-primary hover:bg-surface bg-transparent gap-2 px-5 h-11"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    {/* Next / Finish button */}
                    {step < TOTAL_STEPS ? (
                        <Button
                            type="button"
                            onClick={goNext}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2 px-6 h-11 font-medium shadow-lg shadow-brand-primary/20"
                        >
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleFinish}
                            disabled={saving}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2 px-6 h-11 font-medium shadow-lg shadow-brand-primary/20"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Rocket className="w-4 h-4" />
                                    Start Preparing
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// -- Utility ------------------------------------------------------------------

function parseExperienceYears(value: string): number {
    const map: Record<string, number> = {
        "0-1": 0,
        "1-3": 2,
        "3-5": 4,
        "5-8": 6,
        "8+": 10,
    };
    return map[value] ?? 0;
}
