"use client";

import { motion } from "framer-motion";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const sectionVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
};

const FAQ_ITEMS = [
    {
        question: "What makes CrackTheRole different from LeetCode?",
        answer:
            "LeetCode is great for practicing algorithms, but it does not simulate real interviews. CrackTheRole gives you an AI interviewer that asks follow-up questions, evaluates your communication, and provides company-specific context. Think of it as the difference between practicing scales and performing a concert.",
    },
    {
        question: "Is it really free to start?",
        answer:
            "Yes. You get 3 full mock interviews per week, access to 50 practice questions, and daily challenges -- all completely free, forever. No credit card required.",
    },
    {
        question: "Which companies are covered?",
        answer:
            "We cover 50+ Indian and global tech companies including Google, Amazon, Microsoft, Flipkart, Razorpay, PhonePe, Uber, Swiggy, Zerodha, and more. Each company has questions tagged by specific interview rounds.",
    },
    {
        question: "How does the AI interview work?",
        answer:
            "You select an interview type (DSA, System Design, Behavioral, or SQL) and the AI starts a realistic interview session. It asks questions, follows up on your answers, challenges your assumptions, and at the end generates a detailed scorecard.",
    },
    {
        question: "Can I use this for non-tech roles?",
        answer:
            "Currently, CrackTheRole is focused on tech roles: Data Engineer, Backend SWE, ML Engineer, Frontend SWE, and DevOps. We are actively working on adding Product Manager and Business Analyst tracks.",
    },
    {
        question: "Will payments be available soon?",
        answer:
            "Yes! We are integrating Razorpay for seamless UPI, card, and net banking payments. Join the waitlist to be notified when Pro and Elite plans go live.",
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer:
            "Absolutely. Pro is month-to-month with no lock-in. Cancel anytime from your profile page. Elite is a one-time payment with lifetime access.",
    },
];

export default function Faq() {
    return (
        <section
            id="faq"
            className="py-28 px-4 sm:px-6 lg:px-8 border-t border-border/40"
        >
            <div className="container mx-auto max-w-3xl">
                {/* Heading */}
                <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="text-center mb-14"
                >
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary-light mb-4">
                        FAQ
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
                        Frequently Asked Questions
                    </h2>
                </motion.div>

                {/* Accordion */}
                <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                >
                    <Accordion type="single" collapsible className="w-full">
                        {FAQ_ITEMS.map((item, index) => (
                            <AccordionItem
                                key={index}
                                value={`faq-${index}`}
                                className="border-border/50"
                            >
                                <AccordionTrigger className="text-sm font-semibold text-text-primary hover:no-underline hover:text-brand-primary-light transition-colors py-5">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-text-secondary leading-relaxed">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    );
}
