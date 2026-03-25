import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | CrackTheRole",
  description: "View your interview analytics, resumes, and upcoming practice sessions.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
