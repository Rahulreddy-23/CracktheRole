import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | CrackTheRole - AI Interview Prep for 40LPA+ Roles",
    default: "CrackTheRole - AI Interview Coach for 40LPA+ Tech Roles",
  },
  description:
    "Crack your next software engineering interview with AI-powered mock interviews, company-specific prep, real-time code editor, and salary intelligence. Built for Indian engineers targeting 40LPA+ roles.",
  keywords: [
    "interview preparation",
    "AI mock interview",
    "software engineering",
    "DSA practice",
    "system design",
    "salary negotiation",
    "40 LPA",
    "tech interviews India",
  ],
  openGraph: {
    title: "CrackTheRole - AI Interview Coach for 40LPA+ Tech Roles",
    description:
      "AI-powered mock interviews, company-specific prep, and salary intelligence for Indian software engineers.",
    type: "website",
    locale: "en_IN",
    siteName: "CrackTheRole",
  },
  twitter: {
    card: "summary_large_image",
    title: "CrackTheRole - AI Interview Coach",
    description:
      "Crack your next 40LPA+ tech interview with AI-powered practice sessions.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-brand-primary focus:text-white focus:text-sm focus:font-medium focus:shadow-lg"
        >
          Skip to content
        </a>
        <TooltipProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1A1A2E",
                color: "#FFFFFF",
                border: "1px solid #1E293B",
              },
            }}
          />
        </TooltipProvider>
      </body>
    </html>
  );
}
