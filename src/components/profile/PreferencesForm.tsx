"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
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
import { useUserContext } from "@/components/providers/user-provider";
import { createClient } from "@/lib/supabase/client";

const JOB_ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Mobile Engineer",
  "DevOps Engineer",
  "Data Engineer",
  "Machine Learning Engineer",
  "Engineering Manager",
  "Staff Engineer",
  "Principal Engineer",
];

const TARGET_COMPANIES = [
  "Google", "Amazon", "Microsoft", "Meta", "Apple",
  "Flipkart", "Razorpay", "PhonePe", "Uber", "Swiggy",
  "Zerodha", "CRED", "Meesho", "Atlassian", "Stripe",
];

interface Props {
  initialRole: string;
  initialCompanies: string[];
  initialCurrentCtc: number;
  initialTargetCtc: number;
}

export default function PreferencesForm({
  initialRole,
  initialCompanies,
  initialCurrentCtc,
  initialTargetCtc,
}: Props) {
  const { user } = useUserContext();
  const [targetRole, setTargetRole] = useState(initialRole || "");
  const [targetCompanies, setTargetCompanies] = useState<string[]>(initialCompanies);
  const [currentCtc, setCurrentCtc] = useState(String(initialCurrentCtc || ""));
  const [targetCtc, setTargetCtc] = useState(String(initialTargetCtc || ""));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleCompany(company: string) {
    setTargetCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : prev.length < 5
        ? [...prev, company]
        : prev
    );
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          target_role: targetRole,
          target_companies: targetCompanies,
          current_ctc: parseInt(currentCtc) || 0,
          target_ctc: parseInt(targetCtc) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to save preferences.");
        return;
      }

      setSaved(true);
      toast.success("Preferences saved successfully.");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border/50 bg-surface/80 p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-5">Preferences</h3>

      <div className="space-y-5">
        {/* Target Role */}
        <div>
          <Label className="text-xs text-text-secondary mb-1.5 block">Target Role</Label>
          <Select value={targetRole} onValueChange={setTargetRole}>
            <SelectTrigger className="bg-background border-border/50 text-text-primary h-9">
              <SelectValue placeholder="Select your target role" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border/50">
              {JOB_ROLES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Companies */}
        <div>
          <Label className="text-xs text-text-secondary mb-1.5 block">
            Target Companies <span className="text-text-secondary/50">(select up to 5)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {TARGET_COMPANIES.map((company) => {
              const selected = targetCompanies.includes(company);
              return (
                <button
                  key={company}
                  onClick={() => toggleCompany(company)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    selected
                      ? "bg-brand-primary/20 border-brand-primary/50 text-brand-primary-light"
                      : "bg-transparent border-border/50 text-text-secondary hover:border-border hover:text-text-primary"
                  }`}
                >
                  {company}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTC fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-text-secondary mb-1.5 block">Current CTC (LPA)</Label>
            <Input
              type="number"
              min={0}
              value={currentCtc}
              onChange={(e) => setCurrentCtc(e.target.value)}
              placeholder="e.g. 12"
              className="bg-background border-border/50 text-text-primary placeholder:text-text-secondary/40 h-9"
            />
          </div>
          <div>
            <Label className="text-xs text-text-secondary mb-1.5 block">Target CTC (LPA)</Label>
            <Input
              type="number"
              min={0}
              value={targetCtc}
              onChange={(e) => setTargetCtc(e.target.value)}
              placeholder="e.g. 40"
              className="bg-background border-border/50 text-text-primary placeholder:text-text-secondary/40 h-9"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white h-10 font-medium shadow-lg shadow-brand-primary/20 gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
