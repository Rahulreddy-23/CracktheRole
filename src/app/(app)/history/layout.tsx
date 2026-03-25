import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History | CrackTheRole",
  description: "Review your past mock interviews, scores, and feedback.",
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
