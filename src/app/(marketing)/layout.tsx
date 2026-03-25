import type { Metadata } from "next";
import Navbar from "@/components/marketing/navbar";
import Footer from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "CrackTheRole - AI-Powered Interview Prep for Indian Engineers",
  description: "Practice mock interviews with AI, build stunning resumes, and execute real code — all in one platform built for Indian engineers.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
