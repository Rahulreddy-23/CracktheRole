"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Target, PenTool, FileText, Download, Eye, ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/page-header";
import EmptyState from "@/components/shared/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { getUserResumes } from "@/lib/db";
import { cn } from "@/lib/utils";

type FirestoreResume = {
  id: string;
  userId: string;
  type: "tailor" | "scratch";
  personalInfo?: { fullName?: string };
  isPaidDownload: boolean;
  updatedAt: { toDate?: () => Date; seconds?: number } | Date;
  createdAt: { toDate?: () => Date; seconds?: number } | Date;
};

function toDate(val: FirestoreResume["updatedAt"] | undefined): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof (val as { toDate?: () => Date }).toDate === "function")
    return (val as { toDate: () => Date }).toDate();
  if (typeof (val as { seconds?: number }).seconds === "number")
    return new Date((val as { seconds: number }).seconds * 1000);
  return null;
}

function formatDate(val: FirestoreResume["updatedAt"] | undefined): string {
  const d = toDate(val);
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const PATH_CARDS = [
  {
    title: "Tailor Your Resume",
    icon: Target,
    description:
      "Upload your existing resume and a job description. AI will analyze and generate a tailored version.",
    href: "/resume/tailor",
    label: "Start Tailoring",
    color: "blue",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    hoverBorder: "hover:border-blue-500/30",
    hoverBg: "hover:bg-blue-500/5",
  },
  {
    title: "Build from Scratch",
    icon: PenTool,
    description:
      "Create a professional resume step-by-step. AI will enhance your bullet points and optimize formatting.",
    href: "/resume/scratch",
    label: "Start Building",
    color: "cyan",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
    hoverBorder: "hover:border-cyan-500/30",
    hoverBg: "hover:bg-cyan-500/5",
  },
] as const;

export default function ResumeHubPage() {
  const { user, userProfile } = useAuth();
  const [resumes, setResumes] = useState<FirestoreResume[]>([]);
  const [loading, setLoading] = useState(true);

  const isPro = userProfile?.plan === "pro";

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    getUserResumes(user.uid)
      .then((data) => setResumes(data as FirestoreResume[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <PageHeader
          title="Resume Builder"
          description="Create or tailor your resume with AI"
        />
      </motion.div>

      {/* Path cards */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {PATH_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="group">
              <div
                className={cn(
                  "glass rounded-xl p-6 h-full flex flex-col gap-4 transition-all duration-300 hover:scale-[1.01] cursor-pointer",
                  card.hoverBorder,
                  card.hoverBg
                )}
              >
                <div className="flex items-start justify-between">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", card.iconBg)}>
                    <Icon className={cn("w-6 h-6", card.iconColor)} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/50 mt-1 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1.5">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <Button size="sm" variant="outline" className="pointer-events-none text-xs">
                    {card.label}
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </motion.div>

      {/* Recent Resumes */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="space-y-4"
      >
        <h2 className="text-base font-semibold">Recent Resumes</h2>

        <div className="glass rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20 ml-auto rounded" />
                </div>
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No resumes yet"
              description="Build or tailor a resume to see it here."
              actionLabel="Build Resume"
              actionHref="/resume/scratch"
            />
          ) : (
            <div className="divide-y divide-white/5">
              {resumes.map((resume) => (
                <div key={resume.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {resume.personalInfo?.fullName || "Untitled Resume"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(resume.updatedAt)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium shrink-0",
                      resume.type === "tailor"
                        ? "bg-blue-500/15 text-blue-400 border-blue-500/20"
                        : "bg-cyan-500/15 text-cyan-400 border-cyan-500/20"
                    )}
                  >
                    {resume.type === "tailor" ? "Tailored" : "From Scratch"}
                  </Badge>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button asChild size="sm" variant="ghost" className="h-8 text-xs gap-1.5">
                      <Link href={`/resume/${resume.id}/view`}>
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant={resume.isPaidDownload || isPro ? "outline" : "ghost"}
                      className="h-8 text-xs gap-1.5"
                      asChild={resume.isPaidDownload || isPro}
                    >
                      {resume.isPaidDownload || isPro ? (
                        <Link href={`/resume/${resume.id}/download`}>
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </Link>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
