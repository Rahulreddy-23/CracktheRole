"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// -- Data ---------------------------------------------------------------------

const PRODUCT_LINKS = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Question Bank", href: "#", comingSoon: true },
    { label: "Salary Data", href: "#", comingSoon: true },
];

const RESOURCE_LINKS = [
    { label: "Blog", href: "#", comingSoon: true },
    { label: "Documentation", href: "#", comingSoon: true },
    { label: "API", href: "#", comingSoon: true },
    { label: "Status", href: "#", comingSoon: true },
];

const LEGAL_LINKS = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Contact Us", href: "#" },
];

const SOCIAL_LINKS = [
    { label: "Twitter / X", href: "#", icon: TwitterIcon },
    { label: "LinkedIn", href: "#", icon: LinkedInIcon },
    { label: "YouTube", href: "#", icon: YouTubeIcon },
];

// -- Component ----------------------------------------------------------------

export default function Footer() {
    return (
        <TooltipProvider>
            <footer className="border-t border-border/40 bg-surface/30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                        {/* Column 1 - Brand */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2.5 mb-4"
                            >
                                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
                                    <Zap
                                        className="w-4 h-4 text-white"
                                        strokeWidth={2.5}
                                    />
                                </div>
                                <span className="font-bold text-lg text-text-primary">
                                    CrackTheRole
                                </span>
                            </Link>
                            <p className="text-sm text-text-secondary leading-relaxed mb-5 max-w-xs">
                                AI-powered mock interviews and salary intelligence built for
                                India&apos;s ambitious engineers.
                            </p>
                            <div className="flex items-center gap-3">
                                {SOCIAL_LINKS.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border hover:bg-surface transition-all duration-200"
                                    >
                                        <social.icon />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Column 2 - Product */}
                        <FooterLinkColumn title="Product" links={PRODUCT_LINKS} />

                        {/* Column 3 - Resources */}
                        <FooterLinkColumn title="Resources" links={RESOURCE_LINKS} />

                        {/* Column 4 - Legal */}
                        <FooterLinkColumn title="Legal" links={LEGAL_LINKS} />
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-border/30">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-center gap-2">
                        <p className="text-sm text-text-secondary/50 text-center">
                            &copy; 2026 CrackTheRole. Built for India&apos;s ambitious
                            engineers.
                        </p>
                    </div>
                </div>
            </footer>
        </TooltipProvider>
    );
}

// -- FooterLinkColumn ---------------------------------------------------------

interface FooterLink {
    label: string;
    href: string;
    comingSoon?: boolean;
}

interface FooterLinkColumnProps {
    title: string;
    links: FooterLink[];
}

function FooterLinkColumn({ title, links }: FooterLinkColumnProps) {
    return (
        <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">
                {title}
            </h4>
            <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                    <li key={link.label}>
                        {link.comingSoon ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-sm text-text-secondary/60 cursor-default hover:text-text-secondary transition-colors duration-200">
                                        {link.label}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    sideOffset={6}
                                    className="bg-surface border border-border/60 text-text-secondary text-xs px-3 py-1.5"
                                >
                                    Coming Soon
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <a
                                href={link.href}
                                className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                            >
                                {link.label}
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// -- SVG Icons ----------------------------------------------------------------

function TwitterIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

function YouTubeIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    );
}
