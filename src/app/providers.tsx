"use client";

import type { JSX } from "react";
import { AuthProvider } from "@/hooks/use-auth";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <AuthProvider>{children}</AuthProvider>;
}
