"use client";

import Image from "next/image";
import { User, Briefcase, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useUserContext } from "@/components/providers/user-provider";

export default function ProfileCard() {
  const { user, profile } = useUserContext();

  const avatarUrl = profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null;
  const name = profile?.full_name ?? user?.user_metadata?.full_name ?? "User";
  const email = user?.email ?? "";
  const targetRole = profile?.target_role || null;
  const experienceYears = profile?.experience_years ?? 0;
  const memberSince = new Date(user?.created_at ?? Date.now()).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-xl border border-border/50 bg-surface/80 overflow-hidden"
    >
      {/* Top accent gradient */}
      <div
        className="h-20"
        style={{
          background:
            "linear-gradient(135deg, rgba(108,60,225,0.25) 0%, rgba(6,182,212,0.15) 50%, rgba(16,185,129,0.1) 100%)",
        }}
      />

      <div className="px-6 pb-6 -mt-10">
        {/* Avatar */}
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-surface bg-brand-primary/20 flex items-center justify-center mb-4 shadow-lg">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-9 h-9 text-brand-primary-light" />
          )}
        </div>

        {/* Name & email */}
        <h2 className="text-xl font-bold text-text-primary">{name}</h2>
        <p className="text-sm text-text-secondary mt-0.5">{email}</p>

        {/* Role & details */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {targetRole && (
            <Badge
              variant="outline"
              className="text-xs bg-brand-primary/10 text-brand-primary-light border-brand-primary/30 gap-1"
            >
              <Briefcase className="w-3 h-3" />
              {targetRole}
            </Badge>
          )}
          {experienceYears > 0 && (
            <Badge
              variant="outline"
              className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
            >
              {experienceYears} {experienceYears === 1 ? "year" : "years"} exp
            </Badge>
          )}
        </div>

        {/* Member since */}
        <div className="flex items-center gap-1.5 mt-4 text-xs text-text-secondary/60">
          <Calendar className="w-3 h-3" />
          <span>Member since {memberSince}</span>
        </div>
      </div>
    </motion.div>
  );
}
