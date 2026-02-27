"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES = ["Data Engineer", "Backend SWE", "ML Engineer"];
const CITIES = [
  { value: "bangalore", label: "Bangalore" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "pune", label: "Pune" },
  { value: "delhi_ncr", label: "Delhi NCR" },
  { value: "chennai", label: "Chennai" },
  { value: "mumbai", label: "Mumbai" },
  { value: "remote", label: "Remote" },
];

const schema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  experience_years: z.number().min(0).max(30),
  base_salary: z.number().min(1, "Base salary required"),
  bonus: z.number().min(0),
  esop_value: z.number().min(0),
  total_ctc: z.number().min(1, "Total CTC required"),
  city: z.string().min(1, "City is required"),
}).refine(
  (d) => Math.abs(d.total_ctc - (d.base_salary + d.bonus + d.esop_value)) <= 1,
  { message: "Total CTC must equal Base + Bonus + ESOP", path: ["total_ctc"] }
);

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  company: string;
  role: string;
  experience_years: string;
  base_salary: string;
  bonus: string;
  esop_value: string;
  total_ctc: string;
  city: string;
}

const EMPTY: FormState = {
  company: "",
  role: "",
  experience_years: "",
  base_salary: "",
  bonus: "0",
  esop_value: "0",
  total_ctc: "",
  city: "bangalore",
};

export default function ContributeDialog({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  // Auto-compute total CTC
  function autoTotal() {
    const base = parseFloat(form.base_salary) || 0;
    const bonus = parseFloat(form.bonus) || 0;
    const esop = parseFloat(form.esop_value) || 0;
    const total = base + bonus + esop;
    if (total > 0) set("total_ctc", String(total));
  }

  async function handleSubmit() {
    const parsed = schema.safeParse({
      company: form.company,
      role: form.role,
      experience_years: parseInt(form.experience_years) || 0,
      base_salary: parseFloat(form.base_salary) || 0,
      bonus: parseFloat(form.bonus) || 0,
      esop_value: parseFloat(form.esop_value) || 0,
      total_ctc: parseFloat(form.total_ctc) || 0,
      city: form.city,
    });

    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errs[issue.path[0] as string] = issue.message;
      }
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Failed to submit");
        return;
      }

      toast.success("Thank you! Your anonymous contribution helps the community.");
      setForm(EMPTY);
      onSuccess();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    setForm(EMPTY);
    setErrors({});
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-surface border border-border/50 text-text-primary max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Contribute Your Salary</DialogTitle>
          <DialogDescription className="text-text-secondary text-sm">
            All submissions are anonymous. Amounts in LPA (Lakhs Per Annum).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Company + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-text-secondary mb-1.5 block">Company</Label>
              <Input
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="e.g. Google"
                className="bg-background border-border/50 text-text-primary placeholder:text-text-secondary/40 h-9"
              />
              {errors.company && <p className="text-xs text-brand-danger mt-1">{errors.company}</p>}
            </div>
            <div>
              <Label className="text-xs text-text-secondary mb-1.5 block">Role</Label>
              <Select value={form.role} onValueChange={(v) => set("role", v)}>
                <SelectTrigger className="h-9 bg-background border-border/50 text-text-primary">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border/50">
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-brand-danger mt-1">{errors.role}</p>}
            </div>
          </div>

          {/* Experience + City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-text-secondary mb-1.5 block">Experience Years</Label>
              <Input
                type="number"
                min={0}
                max={30}
                value={form.experience_years}
                onChange={(e) => set("experience_years", e.target.value)}
                placeholder="e.g. 3"
                className="bg-background border-border/50 text-text-primary placeholder:text-text-secondary/40 h-9"
              />
            </div>
            <div>
              <Label className="text-xs text-text-secondary mb-1.5 block">City</Label>
              <Select value={form.city} onValueChange={(v) => set("city", v)}>
                <SelectTrigger className="h-9 bg-background border-border/50 text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border/50">
                  {CITIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary fields */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-text-secondary mb-1.5 block">Base (LPA)</Label>
              <Input
                type="number"
                min={0}
                value={form.base_salary}
                onChange={(e) => set("base_salary", e.target.value)}
                onBlur={autoTotal}
                placeholder="e.g. 28"
                className="bg-background border-border/50 text-text-primary placeholder:text-text-secondary/40 h-9"
              />
              {errors.base_salary && <p className="text-xs text-brand-danger mt-1">{errors.base_salary}</p>}
            </div>
            <div>
              <Label className="text-xs text-text-secondary mb-1.5 block">Bonus (LPA)</Label>
              <Input
                type="number"
                min={0}
                value={form.bonus}
                onChange={(e) => set("bonus", e.target.value)}
                onBlur={autoTotal}
                className="bg-background border-border/50 text-text-primary h-9"
              />
            </div>
            <div>
              <Label className="text-xs text-text-secondary mb-1.5 block">ESOP (LPA)</Label>
              <Input
                type="number"
                min={0}
                value={form.esop_value}
                onChange={(e) => set("esop_value", e.target.value)}
                onBlur={autoTotal}
                className="bg-background border-border/50 text-text-primary h-9"
              />
            </div>
          </div>

          {/* Total CTC */}
          <div>
            <Label className="text-xs text-text-secondary mb-1.5 block">Total CTC (LPA)</Label>
            <Input
              type="number"
              min={0}
              value={form.total_ctc}
              onChange={(e) => set("total_ctc", e.target.value)}
              placeholder="Must equal Base + Bonus + ESOP"
              className="bg-background border-border/50 text-text-primary placeholder:text-text-secondary/40 h-9"
            />
            {errors.total_ctc && <p className="text-xs text-brand-danger mt-1">{errors.total_ctc}</p>}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white h-10 font-medium shadow-lg shadow-brand-primary/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Anonymously"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
