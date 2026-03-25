import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mock Interview | CrackTheRole",
  description: "Practice technical and behavioral interviews with real-time AI feedback.",
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
