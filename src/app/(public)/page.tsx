import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Stats from "@/components/landing/Stats";
import Testimonials from "@/components/landing/Testimonials";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <Faq />
      <CtaBanner />
      <Footer />
    </div>
  );
}

function Faq() {
  const faqs = [
    {
      q: "Is CracktheRole free to use?",
      a: "Yes. You get 3 full AI mock interviews per week for free, forever. Premium plans unlock unlimited interviews, advanced company-specific packs, and salary negotiation coaching.",
    },
    {
      q: "Which companies does the prep cover?",
      a: "We cover 50+ companies including MAANG, Indian unicorns (Razorpay, PhonePe, Swiggy, Zepto, Cred), and top MNCs with India engineering offices. More are added every month.",
    },
    {
      q: "How realistic are the AI interviews?",
      a: "Very. Our AI is trained on real interview transcripts and adapts follow-up questions based on your answers, just like a human interviewer would. Users consistently report it's harder than the real thing — which is exactly the point.",
    },
    {
      q: "Can I practice system design interviews?",
      a: "Yes. System design sessions include a shared canvas for architecture diagrams, voice-style conversation flow, and detailed rubric-based scoring covering scalability, reliability, and design clarity.",
    },
  ];

  return (
    <section
      id="faq"
      className="py-28 px-4 sm:px-6 lg:px-8 border-t border-border/40"
    >
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary-light mb-4">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Common Questions
          </h2>
        </div>
        <div className="divide-y divide-border/50">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group py-5 cursor-pointer list-none [&::marker]:hidden"
            >
              <summary className="flex items-center justify-between gap-4 text-sm font-semibold text-text-primary select-none list-none">
                {faq.q}
                <span className="shrink-0 text-text-secondary group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div
          className="relative rounded-3xl border border-brand-primary/25 overflow-hidden text-center py-20 px-6"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(108,60,225,0.2) 0%, transparent 70%), #1A1A2E",
          }}
        >
          <div className="absolute top-0 left-[15%] right-[15%] h-px bg-linear-to-r from-transparent via-brand-primary/40 to-transparent" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight mb-4">
            Ready to Crack Your Dream Role?
          </h2>
          <p className="text-lg text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
            Join thousands of engineers preparing smarter. Start with 3 free
            interviews this week.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-xl shadow-brand-primary/30 font-medium px-8 h-12 text-[15px]"
          >
            <Link href="/login">Start Free Practice</Link>
          </Button>
          <p className="text-xs text-text-secondary/50 mt-4">
            No credit card required. Takes 30 seconds to sign up.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-base text-text-primary">
            CracktheRole
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-text-secondary">
          <a href="#" className="hover:text-text-primary transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-text-primary transition-colors">
            Terms
          </a>
          <Link
            href="/pricing"
            className="hover:text-text-primary transition-colors"
          >
            Pricing
          </Link>
        </div>
        <p className="text-sm text-text-secondary/50">
          &copy; {new Date().getFullYear()} CracktheRole
        </p>
      </div>
    </footer>
  );
}
