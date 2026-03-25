"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Sparkles, Save, ChevronRight } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/page-header";
import UploadZone from "@/components/resume/upload-zone";
import ResumePreview from "@/components/resume/resume-preview";
import dynamic from "next/dynamic";
const DownloadGate = dynamic(() => import("@/components/resume/download-gate"), { ssr: false });
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { saveResumeData } from "@/lib/db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/types";

type TailorResult = {
  matchScore: number;
  tailoredResume: Partial<ResumeData>;
  improvements: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
      : score >= 60
      ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
      : "bg-red-500/15 text-red-400 border-red-500/20";

  return (
    <Badge variant="outline" className={cn("text-sm font-bold px-3 py-1", color)}>
      {score}% Match
    </Badge>
  );
}

export default function TailorPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<"input" | "result">("input");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [savedResumeId, setSavedResumeId] = useState<string | null>(null);
  const [isPaidDownload, setIsPaidDownload] = useState(false);
  const [saving, setSaving] = useState(false);

  const isPro = userProfile?.plan === "pro";

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || !resumeText.trim()) {
      toast.error("Please provide both a job description and a resume.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/resume/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resumeText }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 429) {
        toast.error("Limit reached. Upgrade for more access.", {
          action: { label: "Upgrade", onClick: () => router.push("/settings") },
        });
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as TailorResult;
      setResult(data);
      setStep("result");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid || !result?.tailoredResume) return;
    setSaving(true);
    try {
      const id = savedResumeId ?? uuidv4();
      const resumeDoc: ResumeData = {
        id,
        userId: user.uid,
        type: "tailor",
        personalInfo: {
          fullName: "",
          email: "",
          phone: "",
          location: "",
          ...(result.tailoredResume.personalInfo ?? {}),
        },
        summary: result.tailoredResume.summary ?? "",
        experience: result.tailoredResume.experience ?? [],
        education: result.tailoredResume.education ?? [],
        skills: result.tailoredResume.skills ?? [],
        projects: result.tailoredResume.projects ?? [],
        certifications: result.tailoredResume.certifications ?? [],
        isPaidDownload,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await saveResumeData(resumeDoc);
      setSavedResumeId(id);
      toast.success("Resume saved!");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Tailor Your Resume"
          description="AI analyzes your resume against the job description"
        >
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Link href="/resume">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
        </PageHeader>
      </motion.div>

      {step === "input" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Job Description */}
          <div className="glass rounded-xl p-6 space-y-3">
            <div>
              <h3 className="font-semibold text-sm mb-0.5">Job Description</h3>
              <p className="text-xs text-muted-foreground">Paste the full job posting</p>
            </div>
            <Textarea
              placeholder="Paste the job description here…"
              className="min-h-64 resize-none text-sm bg-white/3 border-white/10 focus:border-blue-500/40"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-right">{jobDescription.length} chars</p>
          </div>

          {/* Resume upload */}
          <div className="glass rounded-xl p-6 space-y-3">
            <div>
              <h3 className="font-semibold text-sm mb-0.5">Your Resume</h3>
              <p className="text-xs text-muted-foreground">Upload or paste your existing resume</p>
            </div>
            <UploadZone
              onFileRead={(text) => setResumeText(text)}
            />
            <Textarea
              placeholder="Or paste your resume text here…"
              className="min-h-40 resize-none text-sm bg-white/3 border-white/10 focus:border-blue-500/40"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-right">{resumeText.length} chars</p>
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <Button
              onClick={handleAnalyze}
              disabled={loading || !jobDescription.trim() || !resumeText.trim()}
              size="lg"
              className="gap-2 min-w-40"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  AI is analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze & Tailor
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {loading && (
            <div className="lg:col-span-2 glass rounded-xl p-6 text-center space-y-2">
              <div className="flex items-center justify-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              </div>
              <p className="text-sm text-muted-foreground">AI is analyzing your resume against the job description…</p>
            </div>
          )}
        </motion.div>
      )}

      {step === "result" && result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Result header bar */}
          <div className="glass rounded-xl px-5 py-4 flex flex-wrap items-center gap-4">
            <ScoreBadge score={result.matchScore} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {result.matchScore >= 80
                  ? "Excellent match! Your resume is well-aligned with this job."
                  : result.matchScore >= 60
                  ? "Good match. A few improvements can make it stronger."
                  : "Low match. The AI has tailored the content significantly."}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button onClick={handleSave} disabled={saving} variant="outline" size="sm" className="gap-1.5">
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving…" : "Save"}
              </Button>
              <DownloadGate
                resumeId={savedResumeId ?? "unsaved"}
                contentRef={previewRef}
                userId={user?.uid ?? ""}
                isPro={isPro}
                isPaidDownload={isPaidDownload}
              />
              <Button variant="ghost" size="sm" onClick={() => setStep("input")} className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Edit Input
              </Button>
            </div>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Matched Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedKeywords.map((kw) => (
                  <Badge key={kw} variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    {kw}
                  </Badge>
                ))}
                {result.matchedKeywords.length === 0 && (
                  <p className="text-xs text-muted-foreground">None detected</p>
                )}
              </div>
            </div>
            <div className="glass rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">Missing Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.map((kw) => (
                  <Badge key={kw} variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/20">
                    {kw}
                  </Badge>
                ))}
                {result.missingKeywords.length === 0 && (
                  <p className="text-xs text-muted-foreground">None missing</p>
                )}
              </div>
            </div>
          </div>

          {/* Improvements */}
          {result.improvements.length > 0 && (
            <div className="glass rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">AI Improvements Made</p>
              <ul className="space-y-1.5">
                {result.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-blue-400 mt-0.5 shrink-0">→</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Side-by-side preview */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Original */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Original Resume</p>
              <div className="opacity-40 pointer-events-none select-none">
                <div className="glass rounded-xl p-6 text-sm text-muted-foreground whitespace-pre-wrap min-h-64 max-h-96 overflow-y-auto leading-relaxed">
                  {resumeText.slice(0, 3000) || "Paste your resume text on the left to see the original here."}
                </div>
              </div>
            </div>

            {/* Tailored */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">AI-Tailored Version</p>
              <ResumePreview ref={previewRef} data={result.tailoredResume} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
