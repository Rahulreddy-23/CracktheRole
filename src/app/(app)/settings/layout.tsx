import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | CrackTheRole",
  description: "Manage your profile, preferences, and pro plan.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
