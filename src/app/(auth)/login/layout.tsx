import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In | CrackTheRole",
  description: "Sign in to access your dashboard, resumes, and mock interviews.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
