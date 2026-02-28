"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackToDashboardProps {
    className?: string;
}

export default function BackToDashboard({ className = "" }: BackToDashboardProps) {
    return (
        <Link
            href="/dashboard"
            className={`inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 group mb-4 ${className}`}
        >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Dashboard</span>
        </Link>
    );
}
