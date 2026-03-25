import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Builder | CrackTheRole",
  description: "Tailor your resume for specific job descriptions or build from scratch using AI.",
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
