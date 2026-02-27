"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const sectionVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
};

export default function CtaBanner() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">
                <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="relative rounded-3xl border border-brand-primary/25 overflow-hidden text-center py-20 px-6"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(108,60,225,0.25) 0%, transparent 70%), linear-gradient(180deg, #1A1A2E 0%, #0F0F23 100%)",
                    }}
                >
                    {/* Animated gradient top edge */}
                    <div className="absolute top-0 left-0 right-0 h-px">
                        <div className="h-full w-full bg-linear-to-r from-transparent via-brand-primary/50 to-transparent animate-pulse" />
                    </div>

                    {/* Floating orbs for depth */}
                    <motion.div
                        className="absolute top-[-20%] left-[10%] w-80 h-80 rounded-full pointer-events-none select-none"
                        style={{
                            background:
                                "radial-gradient(circle, rgba(108,60,225,0.15) 0%, transparent 65%)",
                        }}
                        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute bottom-[-15%] right-[5%] w-96 h-96 rounded-full pointer-events-none select-none"
                        style={{
                            background:
                                "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 65%)",
                        }}
                        animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
                        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight mb-4">
                            Ready to Crack Your Dream Role?
                        </h2>
                        <p className="text-lg text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
                            Join thousands of engineers preparing for their next big career
                            move.
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-xl shadow-brand-primary/30 font-medium px-8 h-12 text-[15px] group"
                        >
                            <Link href="/login">
                                Start Practicing Now
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                            </Link>
                        </Button>
                        <p className="text-xs text-text-secondary/50 mt-5">
                            Free forever. No credit card needed.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
