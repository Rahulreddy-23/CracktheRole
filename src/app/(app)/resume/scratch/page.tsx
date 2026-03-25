"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Save, Plus, Trash2, Sparkles, Check, AlertCircle, History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/shared/page-header";
import ResumePreview from "@/components/resume/resume-preview";
import dynamic from "next/dynamic";
const DownloadGate = dynamic(() => import("@/components/resume/download-gate"), { ssr: false });
import { useAuth } from "@/hooks/use-auth";
import { saveResumeData } from "@/lib/db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/types";

// ── Types ────────────────────────────────────────────────────────────────────

type PersonalInfo = ResumeData["personalInfo"];
type Experience = ResumeData["experience"][number];
type Education = ResumeData["education"][number];
type Skill = ResumeData["skills"][number];
type Project = ResumeData["projects"][number];

interface FormState {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
}

// ── Defaults ─────────────────────────────────────────────────────────────────

const defaultForm: FormState = {
  personalInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
};

function blankExp(): Experience {
  return { company: "", role: "", startDate: "", endDate: "", current: false, bullets: [""] };
}
function blankEdu(): Education {
  return { institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" };
}
function blankSkill(): Skill {
  return { category: "", items: [] };
}
function blankProject(): Project {
  return { name: "", description: "", technologies: [], link: "" };
}

// ── Storage helpers ──────────────────────────────────────────────────────────

const LS_KEY = "ctr_resume_scratch_v1";

function loadDraft(): FormState {
  if (typeof window === "undefined") return defaultForm;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as FormState) : defaultForm;
  } catch {
    return defaultForm;
  }
}

function saveDraft(form: FormState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(form));
}

// ── Step config ───────────────────────────────────────────────────────────────

const STEPS = [
  "Personal Info",
  "Summary",
  "Experience",
  "Education",
  "Skills",
  "Projects",
  "Review & Download",
];

// ── Main component ───────────────────────────────────────────────────────────

export default function ScratchPage() {
  const { user, userProfile } = useAuth();
  const previewRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [enhancing, setEnhancing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isPaidDownload] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<FormState | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isPro = userProfile?.plan === "pro";

  // Load draft from localStorage — show restore prompt if there is saved content
  useEffect(() => {
    const draft = loadDraft();
    const hasContent =
      draft.personalInfo.fullName.trim() ||
      draft.personalInfo.email.trim() ||
      draft.summary.trim() ||
      draft.experience.length > 0 ||
      draft.education.length > 0;
    if (hasContent) {
      setPendingDraft(draft);
      setShowRestorePrompt(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft on every change (throttled via useEffect natural batching)
  useEffect(() => {
    saveDraft(form);
  }, [form]);

  const update = useCallback((patch: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...patch }));
  }, []);

  const updatePersonal = (patch: Partial<PersonalInfo>) =>
    update({ personalInfo: { ...form.personalInfo, ...patch } });

  // ── AI enhance helpers ──────────────────────────────────────────────────────

  async function enhanceSummary() {
    if (!form.summary.trim()) return;
    setEnhancing("summary");
    try {
      const res = await fetch("/api/resume/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "summary", content: form.summary }),
      });
      const data = (await res.json()) as { enhanced: string };
      update({ summary: data.enhanced });
      toast.success("Summary enhanced!");
    } catch {
      toast.error("Enhancement failed.");
    } finally {
      setEnhancing(null);
    }
  }

  async function enhanceBullets(expIndex: number) {
    const exp = form.experience[expIndex];
    if (!exp.bullets.some((b) => b.trim())) return;
    setEnhancing(`exp-${expIndex}`);
    try {
      const res = await fetch("/api/resume/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "bullets",
          content: exp.bullets.filter(Boolean).join("\n"),
          context: `${exp.role} at ${exp.company}`,
        }),
      });
      const data = (await res.json()) as { enhanced: string[] };
      const newExp = [...form.experience];
      newExp[expIndex] = { ...exp, bullets: data.enhanced };
      update({ experience: newExp });
      toast.success("Bullets enhanced!");
    } catch {
      toast.error("Enhancement failed.");
    } finally {
      setEnhancing(null);
    }
  }

  // ── Restore handlers ─────────────────────────────────────────────────────────

  function handleRestoreYes() {
    if (pendingDraft) setForm(pendingDraft);
    setShowRestorePrompt(false);
    setPendingDraft(null);
  }

  function handleRestoreNo() {
    saveDraft(defaultForm);
    setShowRestorePrompt(false);
    setPendingDraft(null);
  }

  // ── Validate before advancing from Personal Info ──────────────────────────

  function validateAndNext() {
    setValidationError(null);
    if (step === 0) {
      if (!form.personalInfo.fullName.trim()) {
        setValidationError("Full name is required.");
        return;
      }
      if (!form.personalInfo.email.trim()) {
        setValidationError("Email is required.");
        return;
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(form.personalInfo.email.trim())) {
        setValidationError("Please enter a valid email address.");
        return;
      }
    }
    setStep((s) => s + 1);
  }

  // ── Save ─────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!user?.uid) return;
    setSaving(true);
    try {
      const id = savedId ?? uuidv4();
      const resumeDoc: ResumeData = {
        id,
        userId: user.uid,
        type: "scratch",
        ...form,
        certifications: [],
        isPaidDownload,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await saveResumeData(resumeDoc);
      setSavedId(id);
      toast.success("Resume saved!");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  const canNext = step < STEPS.length - 1;
  const canPrev = step > 0;

  const resumeDataForPreview: Partial<ResumeData> = {
    ...form,
    certifications: [],
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Restore draft prompt ── */}
      {showRestorePrompt && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 flex flex-wrap items-center gap-3"
        >
          <History className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-sm flex-1 min-w-0">
            <span className="font-medium">Resume from saved progress?</span>
            <span className="text-muted-foreground ml-1">
              You have an unfinished draft.
            </span>
          </p>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" onClick={handleRestoreYes} className="h-7 text-xs">
              Restore
            </Button>
            <Button size="sm" variant="ghost" onClick={handleRestoreNo} className="h-7 text-xs text-muted-foreground">
              Start fresh
            </Button>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Build from Scratch"
          description={`Step ${step + 1} of ${STEPS.length} — ${STEPS[step]}`}
        >
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Link href="/resume">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
        </PageHeader>
      </motion.div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all duration-300",
                i < step
                  ? "bg-blue-500"
                  : i === step
                  ? "bg-blue-400"
                  : "bg-white/10"
              )}
              title={s}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            {STEPS[step]}
          </p>
          <p className="text-xs text-muted-foreground">{step + 1} / {STEPS.length}</p>
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && (
            <StepPersonal info={form.personalInfo} onChange={updatePersonal} />
          )}
          {step === 1 && (
            <StepSummary
              summary={form.summary}
              onChange={(v) => update({ summary: v })}
              onEnhance={enhanceSummary}
              enhancing={enhancing === "summary"}
            />
          )}
          {step === 2 && (
            <StepExperience
              items={form.experience}
              onChange={(v) => update({ experience: v })}
              onEnhanceBullets={enhanceBullets}
              enhancing={enhancing}
            />
          )}
          {step === 3 && (
            <StepEducation
              items={form.education}
              onChange={(v) => update({ education: v })}
            />
          )}
          {step === 4 && (
            <StepSkills
              items={form.skills}
              onChange={(v) => update({ skills: v })}
            />
          )}
          {step === 5 && (
            <StepProjects
              items={form.projects}
              onChange={(v) => update({ projects: v })}
            />
          )}
          {step === 6 && (
            <StepReview
              data={resumeDataForPreview}
              previewRef={previewRef}
              userId={user?.uid ?? ""}
              savedId={savedId}
              isPro={isPro}
              isPaidDownload={isPaidDownload}
              saving={saving}
              onSave={handleSave}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Validation error */}
      {validationError && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {validationError}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setValidationError(null); setStep((s) => s - 1); }}
          disabled={!canPrev}
          className="gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          onClick={step === STEPS.length - 1 ? handleSave : validateAndNext}
          size="sm"
          className="gap-1.5"
          disabled={saving}
        >
          {step === STEPS.length - 1 ? (
            <>
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save Resume"}
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Step 1: Personal Info ─────────────────────────────────────────────────────

function StepPersonal({ info, onChange }: { info: PersonalInfo; onChange: (p: Partial<PersonalInfo>) => void }) {
  return (
    <div className="glass rounded-xl p-6 space-y-5">
      <h3 className="font-semibold">Personal Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name *" required>
          <Input placeholder="Ada Lovelace" value={info.fullName} onChange={(e) => onChange({ fullName: e.target.value })} />
        </Field>
        <Field label="Email *">
          <Input type="email" placeholder="ada@example.com" value={info.email} onChange={(e) => onChange({ email: e.target.value })} />
        </Field>
        <Field label="Phone">
          <Input placeholder="+91 98765 43210" value={info.phone} onChange={(e) => onChange({ phone: e.target.value })} />
        </Field>
        <Field label="Location">
          <Input placeholder="Bengaluru, India" value={info.location} onChange={(e) => onChange({ location: e.target.value })} />
        </Field>
        <Field label="LinkedIn URL">
          <Input placeholder="linkedin.com/in/ada" value={info.linkedin ?? ""} onChange={(e) => onChange({ linkedin: e.target.value })} />
        </Field>
        <Field label="GitHub URL">
          <Input placeholder="github.com/ada" value={info.github ?? ""} onChange={(e) => onChange({ github: e.target.value })} />
        </Field>
        <Field label="Portfolio URL" className="sm:col-span-2">
          <Input placeholder="ada.dev" value={info.portfolio ?? ""} onChange={(e) => onChange({ portfolio: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

// ── Step 2: Summary ───────────────────────────────────────────────────────────

function StepSummary({
  summary, onChange, onEnhance, enhancing,
}: { summary: string; onChange: (v: string) => void; onEnhance: () => void; enhancing: boolean }) {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Professional Summary</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={onEnhance}
          disabled={enhancing || !summary.trim()}
          className="gap-1.5 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          {enhancing ? "Enhancing…" : "AI Enhance"}
        </Button>
      </div>
      <Textarea
        placeholder="Write 2-4 sentences highlighting your experience, skills, and what you bring to the role…"
        className="min-h-40 resize-none text-sm bg-white/3 border-white/10 focus:border-blue-500/40"
        value={summary}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">Tip: Write a rough draft first, then use AI Enhance to polish it.</p>
    </div>
  );
}

// ── Step 3: Experience ────────────────────────────────────────────────────────

function StepExperience({
  items, onChange, onEnhanceBullets, enhancing,
}: {
  items: Experience[];
  onChange: (v: Experience[]) => void;
  onEnhanceBullets: (i: number) => void;
  enhancing: string | null;
}) {
  const add = () => onChange([...items, blankExp()]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, patch: Partial<Experience>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const updateBullet = (i: number, j: number, val: string) => {
    const next = [...items];
    const bullets = [...next[i].bullets];
    bullets[j] = val;
    next[i] = { ...next[i], bullets };
    onChange(next);
  };

  const addBullet = (i: number) => {
    const next = [...items];
    next[i] = { ...next[i], bullets: [...next[i].bullets, ""] };
    onChange(next);
  };

  const removeBullet = (i: number, j: number) => {
    const next = [...items];
    next[i] = { ...next[i], bullets: next[i].bullets.filter((_, idx) => idx !== j) };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {items.map((exp, i) => (
        <div key={i} className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Experience {i + 1}</h4>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEnhanceBullets(i)}
                disabled={enhancing === `exp-${i}`}
                className="gap-1.5 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                {enhancing === `exp-${i}` ? "Enhancing…" : "AI Enhance Bullets"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(i)} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company">
              <Input placeholder="Acme Corp" value={exp.company} onChange={(e) => updateItem(i, { company: e.target.value })} />
            </Field>
            <Field label="Role / Title">
              <Input placeholder="Software Engineer" value={exp.role} onChange={(e) => updateItem(i, { role: e.target.value })} />
            </Field>
            <Field label="Start Date">
              <Input placeholder="Jan 2022" value={exp.startDate} onChange={(e) => updateItem(i, { startDate: e.target.value })} />
            </Field>
            <Field label="End Date">
              <Input
                placeholder="Dec 2023"
                value={exp.endDate}
                disabled={exp.current}
                onChange={(e) => updateItem(i, { endDate: e.target.value })}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={exp.current}
              onChange={(e) => updateItem(i, { current: e.target.checked, endDate: e.target.checked ? "" : exp.endDate })}
              className="accent-blue-500"
            />
            <span className="text-muted-foreground">Currently working here</span>
          </label>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Bullet Points</Label>
            {exp.bullets.map((bullet, j) => (
              <div key={j} className="flex gap-2">
                <Input
                  placeholder="Led the migration of X to Y, reducing latency by Z%"
                  value={bullet}
                  onChange={(e) => updateBullet(i, j, e.target.value)}
                  className="flex-1 text-sm bg-white/3 border-white/10"
                />
                <Button size="sm" variant="ghost" onClick={() => removeBullet(i, j)} className="text-muted-foreground hover:text-red-400 px-2">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="ghost" onClick={() => addBullet(i)} className="gap-1.5 text-xs text-muted-foreground">
              <Plus className="w-3.5 h-3.5" />
              Add Bullet
            </Button>
          </div>
        </div>
      ))}

      <Button onClick={add} variant="outline" className="w-full gap-2 border-dashed">
        <Plus className="w-4 h-4" />
        Add Experience
      </Button>
    </div>
  );
}

// ── Step 4: Education ─────────────────────────────────────────────────────────

function StepEducation({ items, onChange }: { items: Education[]; onChange: (v: Education[]) => void }) {
  const add = () => onChange([...items, blankEdu()]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, patch: Partial<Education>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {items.map((edu, i) => (
        <div key={i} className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Education {i + 1}</h4>
            <Button size="sm" variant="ghost" onClick={() => remove(i)} className="text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Institution" className="sm:col-span-2">
              <Input placeholder="Indian Institute of Technology" value={edu.institution} onChange={(e) => updateItem(i, { institution: e.target.value })} />
            </Field>
            <Field label="Degree">
              <Input placeholder="B.Tech" value={edu.degree} onChange={(e) => updateItem(i, { degree: e.target.value })} />
            </Field>
            <Field label="Field of Study">
              <Input placeholder="Computer Science" value={edu.field} onChange={(e) => updateItem(i, { field: e.target.value })} />
            </Field>
            <Field label="Start Date">
              <Input placeholder="Aug 2019" value={edu.startDate} onChange={(e) => updateItem(i, { startDate: e.target.value })} />
            </Field>
            <Field label="End Date">
              <Input placeholder="May 2023" value={edu.endDate} onChange={(e) => updateItem(i, { endDate: e.target.value })} />
            </Field>
            <Field label="GPA (optional)">
              <Input placeholder="9.1 / 10" value={edu.gpa ?? ""} onChange={(e) => updateItem(i, { gpa: e.target.value })} />
            </Field>
          </div>
        </div>
      ))}
      <Button onClick={add} variant="outline" className="w-full gap-2 border-dashed">
        <Plus className="w-4 h-4" />
        Add Education
      </Button>
    </div>
  );
}

// ── Step 5: Skills ────────────────────────────────────────────────────────────

function StepSkills({ items, onChange }: { items: Skill[]; onChange: (v: Skill[]) => void }) {
  const add = () => onChange([...items, blankSkill()]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, patch: Partial<Skill>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {items.map((skill, i) => (
        <div key={i} className="glass rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Skill Category {i + 1}</h4>
            <Button size="sm" variant="ghost" onClick={() => remove(i)} className="text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Category">
              <Input
                placeholder="Languages"
                value={skill.category}
                onChange={(e) => updateItem(i, { category: e.target.value })}
              />
            </Field>
            <Field label="Items (comma-separated)" className="sm:col-span-2">
              <Input
                placeholder="Python, JavaScript, TypeScript"
                value={skill.items.join(", ")}
                onChange={(e) =>
                  updateItem(i, {
                    items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </Field>
          </div>
          {skill.items.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skill.items.map((item) => (
                <span key={item} className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2.5 py-0.5">
                  <Check className="w-3 h-3" />
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
      <Button onClick={add} variant="outline" className="w-full gap-2 border-dashed">
        <Plus className="w-4 h-4" />
        Add Skill Category
      </Button>
    </div>
  );
}

// ── Step 6: Projects ──────────────────────────────────────────────────────────

function StepProjects({ items, onChange }: { items: Project[]; onChange: (v: Project[]) => void }) {
  const add = () => onChange([...items, blankProject()]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, patch: Partial<Project>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {items.map((proj, i) => (
        <div key={i} className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Project {i + 1}</h4>
            <Button size="sm" variant="ghost" onClick={() => remove(i)} className="text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Project Name">
              <Input placeholder="My Awesome App" value={proj.name} onChange={(e) => updateItem(i, { name: e.target.value })} />
            </Field>
            <Field label="Live Link / Repo URL">
              <Input placeholder="https://github.com/…" value={proj.link ?? ""} onChange={(e) => updateItem(i, { link: e.target.value })} />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea
                placeholder="What the project does, your role, and its impact…"
                className="min-h-20 resize-none text-sm bg-white/3 border-white/10"
                value={proj.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
              />
            </Field>
            <Field label="Technologies (comma-separated)" className="sm:col-span-2">
              <Input
                placeholder="Next.js, Firebase, Claude API"
                value={proj.technologies.join(", ")}
                onChange={(e) =>
                  updateItem(i, {
                    technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </Field>
          </div>
        </div>
      ))}
      <Button onClick={add} variant="outline" className="w-full gap-2 border-dashed">
        <Plus className="w-4 h-4" />
        Add Project
      </Button>
    </div>
  );
}

// ── Step 7: Review & Download ─────────────────────────────────────────────────

function StepReview({
  data, previewRef, userId, savedId, isPro, isPaidDownload, saving, onSave,
}: {
  data: Partial<ResumeData>;
  previewRef: React.RefObject<HTMLDivElement | null>;
  userId: string;
  savedId: string | null;
  isPro: boolean;
  isPaidDownload: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Review Your Resume</h3>
          <p className="text-sm text-muted-foreground mt-0.5">This is how your resume will look when downloaded.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onSave} disabled={saving} variant="outline" size="sm" className="gap-1.5">
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving…" : "Save"}
          </Button>
          <DownloadGate
            resumeId={savedId ?? "unsaved"}
            contentRef={previewRef}
            userId={userId}
            isPro={isPro}
            isPaidDownload={isPaidDownload}
          />
        </div>
      </div>
      <ResumePreview ref={previewRef} data={data} />
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label, required, children, className,
}: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}
