"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { useUserContext } from "@/components/providers/user-provider";

export default function ProfileCard() {
  const { user, profile } = useUserContext();

  const avatarUrl = profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null;
  const name = profile?.full_name ?? user?.user_metadata?.full_name ?? "User";
  const email = user?.email ?? "";

  return (
    <div className="rounded-xl border border-border/50 bg-surface/80 p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-brand-primary/20 flex items-center justify-center shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-brand-primary-light" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{name}</h2>
          <p className="text-sm text-text-secondary">{email}</p>
          <p className="text-xs text-text-secondary/60 mt-0.5">
            Member since {new Date(user?.created_at ?? Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
}
