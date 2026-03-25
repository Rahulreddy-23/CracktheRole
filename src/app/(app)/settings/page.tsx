"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import {
  User, CreditCard, Settings2, Crown, Zap, FileText,
  Check, ExternalLink, AlertTriangle, Eye, EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import PageHeader from "@/components/shared/page-header";
import { useAuth } from "@/hooks/use-auth";
import { usePayment } from "@/hooks/use-payment";
import { db, auth } from "@/lib/firebase";
import { PRICING, formatPriceWithGST } from "@/config/constants";
import { LANGUAGE_CONFIG, type SupportedLanguage } from "@/types";
import { cn } from "@/lib/utils";

// ── helpers ───────────────────────────────────────────────────────────────────

type FirestoreDate = { toDate?: () => Date; seconds?: number } | Date | null | undefined;

function toDate(val: FirestoreDate): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof (val as { toDate?: () => Date }).toDate === "function")
    return (val as { toDate: () => Date }).toDate();
  if (typeof (val as { seconds?: number }).seconds === "number")
    return new Date((val as { seconds: number }).seconds * 1000);
  return null;
}

function fmtDate(val: FirestoreDate): string {
  const d = toDate(val);
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const LANGUAGES = Object.entries(LANGUAGE_CONFIG) as [SupportedLanguage, (typeof LANGUAGE_CONFIG)[SupportedLanguage]][];

// ── PricingCard ───────────────────────────────────────────────────────────────

interface PricingCardProps {
  title: string;
  basePrice: number;
  description: string;
  features: string[];
  packType: "starter_pack" | "interview_pack" | "pro_monthly";
  badge?: string;
  highlighted?: boolean;
  period?: string;
}

function PricingCard({ title, basePrice, description, features, packType, badge, highlighted, period }: PricingCardProps) {
  const { purchase, isProcessing } = usePayment();
  const breakdown = formatPriceWithGST(basePrice);

  return (
    <div
      className={cn(
        "glass rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden transition-colors",
        highlighted
          ? "border border-blue-500/40 bg-blue-500/5"
          : "border border-white/10"
      )}
    >
      {badge && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-blue-500 text-white text-xs">{badge}</Badge>
        </div>
      )}

      <div className="space-y-1 pr-16">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div>
        <p className="text-2xl font-bold">
          Rs. {breakdown.totalAmount}
          {period && <span className="text-sm font-normal text-muted-foreground">/{period}</span>}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Base: {breakdown.base} | GST (18%): {breakdown.gst} | Total: {breakdown.total}
        </p>
      </div>

      <ul className="space-y-1.5 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        onClick={() => purchase(packType)}
        disabled={isProcessing}
        className={cn("w-full mt-auto", highlighted ? "" : "variant-outline")}
        variant={highlighted ? "default" : "outline"}
      >
        {isProcessing ? "Processing…" : packType === "pro_monthly" ? "Go Pro" : "Buy Now"}
      </Button>
    </div>
  );
}

// ── Tab: Profile ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [savingName, setSavingName] = useState(false);

  // Password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isEmailUser = user?.providerData.some((p) => p.providerId === "password");
  const initials = (user?.displayName ?? user?.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSaveName = async () => {
    if (!user || !displayName.trim()) return;
    setSavingName(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      await updateDoc(doc(db, "users", user.uid), { displayName: displayName.trim() });
      await refreshProfile();
      toast.success("Display name updated!");
    } catch {
      toast.error("Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePw = async () => {
    if (!user || !isEmailUser) return;
    if (newPw !== confirmPw) { toast.error("Passwords don't match."); return; }
    if (newPw.length < 6) { toast.error("New password must be at least 6 characters."); return; }
    setChangingPw(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPw);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPw);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast.success("Password updated!");
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "auth/wrong-password") toast.error("Current password is incorrect.");
      else toast.error("Failed to update password.");
    } finally {
      setChangingPw(false);
    }
  };

  const handleDelete = async () => {
    if (!user || deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      toast.success("Account deleted.");
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "auth/requires-recent-login") {
        toast.error("Please sign out and sign in again before deleting your account.");
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      {/* Avatar + name */}
      <div className="glass rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <Image src={user.photoURL} alt="Avatar" width={56} height={56} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-xl font-bold text-blue-400">
              {initials}
            </div>
          )}
          <div>
            <p className="font-semibold">{user?.displayName ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Display Name</Label>
          <div className="flex gap-2">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="bg-white/3 border-white/10"
            />
            <Button
              onClick={handleSaveName}
              disabled={savingName || displayName.trim() === (user?.displayName ?? "")}
              size="sm"
              className="shrink-0"
            >
              {savingName ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Email</Label>
          <Input value={user?.email ?? ""} disabled className="bg-white/3 border-white/10 opacity-60" />
        </div>

        {userProfile?.phoneNumber && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Phone</Label>
            <Input value={userProfile.phoneNumber} disabled className="bg-white/3 border-white/10 opacity-60" />
          </div>
        )}
      </div>

      {/* Change password (email users only) */}
      {isEmailUser && (
        <div className="glass rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-sm">Change Password</h3>
          <div className="space-y-3">
            {[
              { label: "Current Password", value: currentPw, set: setCurrentPw },
              { label: "New Password", value: newPw, set: setNewPw },
              { label: "Confirm New Password", value: confirmPw, set: setConfirmPw },
            ].map(({ label, value, set }) => (
              <div key={label} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className="bg-white/3 border-white/10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={handleChangePw}
            disabled={changingPw || !currentPw || !newPw || !confirmPw}
            size="sm"
          >
            {changingPw ? "Updating…" : "Update Password"}
          </Button>
        </div>
      )}

      {/* Danger zone */}
      <div className="glass rounded-xl p-6 space-y-3 border border-red-500/20">
        <h3 className="font-semibold text-sm text-red-400">Danger Zone</h3>
        <p className="text-xs text-muted-foreground">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
        >
          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
          Delete Account
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This will permanently delete your account, interview history, and resumes. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs text-muted-foreground">
              Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm
            </Label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="bg-white/3 border-red-500/20 focus:border-red-500/50"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteConfirm !== "DELETE" || deleting}
            >
              {deleting ? "Deleting…" : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Tab: Billing ──────────────────────────────────────────────────────────────

function BillingTab() {
  const { userProfile } = useAuth();
  const { purchase, isProcessing } = usePayment();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { user, refreshProfile } = useAuth();

  const isPro = userProfile?.plan === "pro";
  const interviewsUsed = userProfile?.interviewsUsed ?? 0;
  const interviewsLimit = userProfile?.interviewsLimit ?? 1;
  const resumesUsed = userProfile?.resumesUsed ?? 0;
  const resumesLimit = userProfile?.resumesLimit ?? 1;

  const razorpayLink = process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK ?? "/settings";

  const handleCancel = async () => {
    if (!user) return;
    setCancelling(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/payments/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to cancel plan");
      }
      await refreshProfile();
      toast.success("Plan cancelled. You're now on the Free plan.");
    } catch {
      toast.error("Failed to cancel plan. Please try again.");
    } finally {
      setCancelling(false);
      setCancelOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Current plan header */}
      <div className="glass rounded-xl p-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          {isPro ? (
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Crown className="w-5 h-5 text-blue-400" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-zinc-500/15 flex items-center justify-center">
              <User className="w-5 h-5 text-zinc-400" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{isPro ? "Pro Plan" : "Free Plan"}</p>
              {isPro && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 inline-block" />
                  Active
                </Badge>
              )}
            </div>
            {isPro && userProfile?.planExpiresAt && (
              <p className="text-xs text-muted-foreground">
                Renews {fmtDate(userProfile.planExpiresAt as FirestoreDate)}
              </p>
            )}
          </div>
        </div>

        <div className="ml-auto flex flex-col sm:flex-row gap-3 flex-1 min-w-0 sm:justify-end">
          <div className="space-y-2 flex-1 min-w-40">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Interviews</span>
              <span>{interviewsUsed}/{interviewsLimit}</span>
            </div>
            <Progress value={interviewsLimit > 0 ? (interviewsUsed / interviewsLimit) * 100 : 0} className="h-1.5" />
          </div>
          <div className="space-y-2 flex-1 min-w-40">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Resumes</span>
              <span>{resumesUsed}/{resumesLimit}</span>
            </div>
            <Progress value={resumesLimit > 0 ? (resumesUsed / resumesLimit) * 100 : 0} className="h-1.5" />
          </div>
        </div>

        {isPro && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCancelOpen(true)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
          >
            Cancel Plan
          </Button>
        )}
      </div>

      {/* Free user — purchase options */}
      {!isPro && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PricingCard
              title={PRICING.starterPack.name}
              basePrice={PRICING.starterPack.basePrice}
              description={PRICING.starterPack.description}
              features={[
                "Download 1 AI-tailored resume as PDF",
                "ATS-friendly format",
                "One-time purchase",
              ]}
              packType="starter_pack"
            />
            <PricingCard
              title={PRICING.interviewPack.name}
              basePrice={PRICING.interviewPack.basePrice}
              description={PRICING.interviewPack.description}
              features={[
                "2 full mock interviews",
                "30 minutes each",
                "Full AI feedback & scoring",
                "One-time purchase",
              ]}
              packType="interview_pack"
            />
            <PricingCard
              title={PRICING.pro.name}
              basePrice={PRICING.pro.basePrice}
              description="Everything you need to land the role"
              features={PRICING.pro.features as unknown as string[]}
              packType="pro_monthly"
              badge="Best Value"
              highlighted
              period="month"
            />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Or{" "}
            <a
              href={razorpayLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground transition-colors"
            >
              pay via payment link
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </p>
        </>
      )}

      {/* Pro user — full feature list */}
      {isPro && (
        <div className="glass rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-sm">Your Pro Features</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(PRICING.pro.features as unknown as string[]).map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cancel confirmation */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Pro Plan</DialogTitle>
            <DialogDescription>
              You'll lose access to Pro features at the end of your current period. Your data will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setCancelOpen(false)}>Keep Pro</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling…" : "Cancel Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Tab: Preferences ──────────────────────────────────────────────────────────

function PreferencesTab() {
  const { user, userProfile, refreshProfile } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = userProfile as any;
  const [language, setLanguage] = useState<SupportedLanguage>(
    (profile?.defaultLanguage as SupportedLanguage) ?? "python"
  );
  const [difficulty, setDifficulty] = useState<string>(
    (profile?.defaultDifficulty as string) ?? "medium"
  );
  const [boilerplate, setBoilerplate] = useState<boolean>(
    Boolean(profile?.defaultBoilerplate)
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        defaultLanguage: language,
        defaultDifficulty: difficulty,
        defaultBoilerplate: boilerplate,
      });
      await refreshProfile();
      toast.success("Preferences saved!");
    } catch {
      toast.error("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="glass rounded-xl p-6 space-y-5">
        <h3 className="font-semibold text-sm">Interview Defaults</h3>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Default Language</Label>
          <Select value={language} onValueChange={(v) => setLanguage(v as SupportedLanguage)}>
            <SelectTrigger className="w-full bg-white/3 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Default Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-full bg-white/3 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="boilerplate-pref" className="font-medium cursor-pointer">
              Starter Code by Default
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Auto-enable function signature templates
            </p>
          </div>
          <Switch
            id="boilerplate-pref"
            checked={boilerplate}
            onCheckedChange={setBoilerplate}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? "Saving…" : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}

// ── Main settings page ────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Settings"
          description="Manage your profile, billing, and preferences"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Tabs defaultValue="billing">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="gap-1.5">
              <User className="w-3.5 h-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-1.5">
              <Settings2 className="w-3.5 h-3.5" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>
          <TabsContent value="preferences">
            <PreferencesTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
