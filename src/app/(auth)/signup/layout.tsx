import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | CrackTheRole",
  description: "Create an account to start practicing AI mock interviews.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
