"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Code2, Layers, MessageSquare, ArrowRight, Clock,
  Shuffle, Lock, Zap, Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/shared/page-header";
import { useAuth } from "@/hooks/use-auth";
import { usePayment } from "@/hooks/use-payment";
import { saveInterviewSession } from "@/lib/db";
import { INTERVIEW_TOPICS, PRICING } from "@/config/constants";
import { LANGUAGE_CONFIG, type SupportedLanguage, type InterviewSession } from "@/types";
import { cn } from "@/lib/utils";

// ── types ──────────────────────────────────────────────────────────────────

type InterviewType = "coding" | "system-design" | "behavioral";
type Difficulty = "easy" | "medium" | "hard";

// ── data ───────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: {
  value: InterviewType;
  label: string;
  sub: string;
  icon: React.ElementType;
  activeClass: string;
  iconClass: string;
}[] = [
  {
    value: "coding",
    label: "Coding",
    sub: "DSA & algorithms",
    icon: Code2,
    activeClass: "border-blue-500/60 bg-blue-500/8 shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    iconClass: "text-blue-400 bg-blue-500/15",
  },
  {
    value: "system-design",
    label: "System Design",
    sub: "Architecture & scale",
    icon: Layers,
    activeClass: "border-cyan-500/60 bg-cyan-500/8 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    iconClass: "text-cyan-400 bg-cyan-500/15",
  },
  {
    value: "behavioral",
    label: "Behavioral",
    sub: "STAR method & soft skills",
    icon: MessageSquare,
    activeClass: "border-purple-500/60 bg-purple-500/8 shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    iconClass: "text-purple-400 bg-purple-500/15",
  },
];

const DIFFICULTY_OPTIONS: {
  value: Difficulty;
  label: string;
  activeClass: string;
}[] = [
  { value: "easy", label: "Easy", activeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
  { value: "medium", label: "Medium", activeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" },
  { value: "hard", label: "Hard", activeClass: "bg-red-500/20 text-red-400 border-red-500/40" },
];

const LANGUAGES = Object.entries(LANGUAGE_CONFIG) as [
  SupportedLanguage,
  (typeof LANGUAGE_CONFIG)[SupportedLanguage]
][];

// ── paywall component ──────────────────────────────────────────────────────

function InterviewPaywall() {
  const razorpayLink = process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK ?? "/settings";
  const { purchase, isProcessing } = usePayment();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <div className="glass rounded-2xl p-6 border border-white/10 text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold mb-1">You&apos;ve used all your free interviews!</h2>
        <p className="text-sm text-muted-foreground">
          Unlock more mock interviews to keep practising.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Interview Pack */}
        <div className="glass rounded-xl p-5 border border-white/10 flex flex-col gap-3 hover:border-blue-500/30 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{PRICING.interviewPack.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {PRICING.interviewPack.description}
              </p>
            </div>
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs shrink-0">
              One-time
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-bold">
              Rs. {PRICING.interviewPack.totalPrice}
            </p>
            <p className="text-xs text-muted-foreground">
              Rs. {PRICING.interviewPack.basePrice} + Rs. {PRICING.interviewPack.gst} GST
            </p>
          </div>
          <Button
            className="w-full mt-auto"
            disabled={isProcessing}
            onClick={() => purchase("interview_pack")}
          >
            {isProcessing ? "Processing…" : <>Buy Now <ArrowRight className="w-4 h-4 ml-1" /></>}
          </Button>
        </div>

        {/* Pro Plan */}
        <div className="glass rounded-xl p-5 border border-blue-500/30 bg-blue-500/5 flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <Badge className="bg-blue-500 text-white text-xs">Best Value</Badge>
          </div>
          <div>
            <p className="font-semibold">{PRICING.pro.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {PRICING.pro.interviews} interviews + {PRICING.pro.resumeDownloads} resumes/month
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              Rs. {PRICING.pro.totalPrice}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Rs. {PRICING.pro.basePrice} + Rs. {PRICING.pro.gst} GST
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full mt-auto border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
            disabled={isProcessing}
            onClick={() => purchase("pro_monthly")}
          >
            {isProcessing ? "Processing…" : <>Go Pro <Zap className="w-4 h-4 ml-1" /></>}
          </Button>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-5">
        Or{" "}
        <a
          href={razorpayLink}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          purchase via payment link
        </a>
      </p>
    </motion.div>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export default function InterviewPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  // Form state
  const [type, setType] = useState<InterviewType>("coding");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [topic, setTopic] = useState<string>("random");
  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [needBoilerplate, setNeedBoilerplate] = useState(false);
  const [includeHints, setIncludeHints] = useState(true);
  const [starting, setStarting] = useState(false);

  const isPro = userProfile?.plan !== "free";
  const interviewsUsed = userProfile?.interviewsUsed ?? 0;
  const interviewsLimit = userProfile?.interviewsLimit ?? 1;
  const limitReached = interviewsUsed >= interviewsLimit;
  const maxDurationMinutes = isPro
    ? PRICING.pro.interviewMaxMinutes
    : PRICING.free.interviewMaxMinutes;

  // Reset topic when type changes
  useEffect(() => {
    setTopic("random");
  }, [type]);

  // Auto-enable boilerplate for SQL
  useEffect(() => {
    if (language === "sql") setNeedBoilerplate(true);
    else setNeedBoilerplate(false);
  }, [language]);

  const topics = INTERVIEW_TOPICS[type] as string[];

  async function handleStart() {
    if (!user) return;
    setStarting(true);

    const resolvedTopic =
      topic === "random"
        ? topics[Math.floor(Math.random() * topics.length)]
        : topic;

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          difficulty,
          topic: resolvedTopic,
          language,
          needBoilerplate,
          includeHints,
          userId: user.uid,
        }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 429) {
        toast.error("Limit reached. Upgrade for more access.", {
          action: { label: "Upgrade", onClick: () => router.push("/settings") },
        });
        setStarting(false);
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `API error ${res.status}`);
      }

      const data = (await res.json()) as {
        problem: InterviewSession["problem"];
        boilerplate: string;
      };

      // For coding interviews with boilerplate enabled, call dedicated endpoint
      // for richer SQL schemas and better function signatures
      let boilerplate = data.boilerplate ?? "";
      if (needBoilerplate && type === "coding") {
        try {
          const bpRes = await fetch("/api/interview/boilerplate", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ language, problem: data.problem, type }),
          });
          if (bpRes.ok) {
            const bpData = (await bpRes.json()) as { boilerplate: string };
            if (bpData.boilerplate) boilerplate = bpData.boilerplate;
          }
        } catch {
          // non-fatal: fall back to inline boilerplate from problem generation
        }
      }

      const sessionId = crypto.randomUUID();
      const session: InterviewSession = {
        id: sessionId,
        userId: user.uid,
        type,
        difficulty,
        language,
        topic: resolvedTopic,
        status: "in-progress",
        problem: data.problem,
        messages: [],
        code: boilerplate,
        startedAt: new Date(),
        maxDurationMinutes,
      };

      await saveInterviewSession(session);
      router.push(`/interview/${sessionId}`);
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to start interview. Please try again."
      );
      setStarting(false);
    }
  }

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <>
      <PageHeader
        title="Mock Interview"
        description="Choose your interview type and configuration"
      />

      {limitReached ? (
        <InterviewPaywall />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl space-y-8"
        >
          {/* ── Row 1: Type ── */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Interview Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = type === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value)}
                    className={cn(
                      "glass rounded-xl p-4 flex items-start gap-3 text-left border border-white/10 transition-all duration-200 hover:border-white/20",
                      active && opt.activeClass
                    )}
                  >
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", opt.iconClass)}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Row 2: Difficulty ── */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Difficulty
            </h2>
            <div className="flex gap-2.5 flex-wrap">
              {DIFFICULTY_OPTIONS.map((opt) => {
                const active = difficulty === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setDifficulty(opt.value)}
                    className={cn(
                      "px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                      active
                        ? opt.activeClass
                        : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Row 3: Topic ── */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Topic
            </h2>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="w-full sm:w-72 bg-secondary border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">
                  <span className="flex items-center gap-2">
                    <Shuffle className="w-3.5 h-3.5 text-muted-foreground" />
                    Random
                  </span>
                </SelectItem>
                {topics.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {/* ── Row 4: Language (coding only) ── */}
          {type === "coding" && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Language
              </h2>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(([key, cfg]) => {
                  const active = language === key;
                  const isSql = key === "sql";
                  return (
                    <button
                      key={key}
                      onClick={() => setLanguage(key)}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200",
                        active
                          ? "border-blue-500/50 bg-blue-500/15 text-blue-300"
                          : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                      )}
                    >
                      {cfg.name}
                      {isSql && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium leading-none ml-0.5">
                          Browser
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {language === "sql" && (
                <p className="flex items-center gap-1.5 text-xs text-amber-400/80">
                  <Info className="w-3.5 h-3.5" />
                  SQL runs in your browser via SQLite (WebAssembly) — no server needed.
                </p>
              )}
            </section>
          )}

          {/* ── Row 5: Options ── */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Options
            </h2>
            <div className="glass rounded-xl p-5 border border-white/10 space-y-4">
              {type === "coding" && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="boilerplate" className="font-medium cursor-pointer">
                      Starter Code
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Include function signature as a starting template
                    </p>
                  </div>
                  <Switch
                    id="boilerplate"
                    checked={needBoilerplate}
                    onCheckedChange={setNeedBoilerplate}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="hints" className="font-medium cursor-pointer">
                    Include Hints
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Allow the AI to give hints when you&apos;re stuck
                  </p>
                </div>
                <Switch
                  id="hints"
                  checked={includeHints}
                  onCheckedChange={setIncludeHints}
                />
              </div>
              <div className="pt-1 border-t border-white/5 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Session duration:</span>
                <span className="font-semibold">{maxDurationMinutes} minutes</span>
                {!isPro && (
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs border-amber-500/30 text-amber-400"
                  >
                    Free tier
                  </Badge>
                )}
              </div>
            </div>
          </section>

          {/* ── Start Button ── */}
          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              onClick={handleStart}
              disabled={starting}
              className="w-full sm:w-auto min-w-48 gap-2"
            >
              {starting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Generating problem…
                </>
              ) : (
                <>
                  Start Interview
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
}
