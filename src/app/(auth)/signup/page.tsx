"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Eye, EyeOff, Loader2, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signUpWithEmail, signInWithGoogle } from "@/lib/auth";
import { createUserDocument } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import { usePhoneAuth } from "@/hooks/use-phone-auth";

// ── Firebase error map ────────────────────────────────────────────────────

const AUTH_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
  "auth/network-request-failed": "Network error. Check your connection.",
};

function friendlyError(code: string) {
  return AUTH_ERRORS[code] ?? "Something went wrong. Please try again.";
}

// ── Password strength ─────────────────────────────────────────────────────

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score: 2, label: "Fair", color: "bg-yellow-500" };
  if (score <= 3) return { score: 3, label: "Good", color: "bg-blue-500" };
  return { score: 4, label: "Strong", color: "bg-green-500" };
}

// ── Animation variants ────────────────────────────────────────────────────

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};
const expand: Variants = {
  hidden: { opacity: 0, height: 0 },
  show: { opacity: 1, height: "auto", transition: { duration: 0.25, ease: "easeOut" as const } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeIn" as const } },
};

// ── Component ─────────────────────────────────────────────────────────────

type SignupTab = "email" | "phone";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [user, authLoading, router]);

  const [tab, setTab] = useState<SignupTab>("email");

  // ── Email/password fields ──
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // ── Phone OTP (shared hook) ──
  const phone$ = usePhoneAuth("recaptcha-signup");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const strength = getPasswordStrength(password);
  const strengthPct = (strength.score / 4) * 100;

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleGoogle() {
    setLoadingGoogle(true);
    try {
      const cred = await signInWithGoogle();
      await createUserDocument(cred.user);
      router.replace("/dashboard");
    } catch (e: unknown) {
      toast.error(friendlyError((e as { code?: string }).code ?? ""));
    } finally {
      setLoadingGoogle(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!agreed) {
      toast.error("Please accept the terms to continue.");
      return;
    }
    setLoadingEmail(true);
    try {
      const cred = await signUpWithEmail(email, password, name);
      await createUserDocument(cred.user);
      router.replace("/dashboard");
    } catch (e: unknown) {
      toast.error(friendlyError((e as { code?: string }).code ?? ""));
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleSendOtp() {
    const sent = await phone$.sendOtp(phone);
    if (sent) setOtp("");
  }

  async function handleConfirmOtp() {
    const cred = await phone$.verifyOtp(otp);
    if (cred) {
      await createUserDocument(cred.user);
      router.replace("/dashboard");
    }
  }

  if (authLoading) return null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">

      {/* Heading */}
      <motion.div variants={item} className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start cracking your dream role</p>
      </motion.div>

      {/* Google button */}
      <motion.div variants={item}>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleGoogle}
          disabled={loadingGoogle}
          className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors disabled:opacity-60"
        >
          {loadingGoogle ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
          Continue with Google
        </motion.button>
      </motion.div>

      {/* Method tabs */}
      <motion.div variants={item} className="flex rounded-lg bg-secondary/50 p-1 gap-1">
        {(
          [
            { id: "email", icon: Mail, label: "Email" },
            { id: "phone", icon: Phone, label: "Phone" },
          ] as const
        ).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
              tab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Email / Password Tab ── */}
        {tab === "email" && (
          <motion.form
            key="email"
            variants={expand}
            initial="hidden"
            animate="show"
            exit="exit"
            onSubmit={handleSignup}
            className="space-y-4 overflow-hidden"
          >
            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength indicator */}
              {password && (
                <div className="space-y-1">
                  <div className="h-1 rounded-full bg-border overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-300", strength.color)}
                      style={{ width: `${strengthPct}%` }}
                    />
                  </div>
                  <p className={cn("text-[11px]",
                    strength.score === 1 && "text-red-400",
                    strength.score === 2 && "text-yellow-400",
                    strength.score === 3 && "text-blue-400",
                    strength.score === 4 && "text-green-400",
                  )}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={cn("pr-10", confirmPassword && password !== confirmPassword && "border-red-500")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[11px] text-red-400">Passwords don&apos;t match</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border accent-primary cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                I agree to the{" "}
                <span className="text-primary hover:underline">Terms of Service</span>{" "}
                and{" "}
                <span className="text-primary hover:underline">Privacy Policy</span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loadingEmail || !agreed || (!!confirmPassword && password !== confirmPassword)}
            >
              {loadingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
          </motion.form>
        )}

        {/* ── Phone OTP Tab ── */}
        {tab === "phone" && (
          <motion.div
            key="phone"
            variants={expand}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-3 overflow-hidden"
          >
            <p className="text-xs text-muted-foreground">
              Enter your Indian mobile number (+91) to create an account via OTP.
            </p>
            {!phone$.isOtpReady ? (
              <div className="flex gap-2">
                <span className="flex items-center px-3 h-10 rounded-md border border-border bg-input text-sm text-foreground shrink-0">
                  +91
                </span>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="flex-1"
                  maxLength={10}
                />
                <Button
                  onClick={handleSendOtp}
                  disabled={phone$.isSending || phone.length < 10}
                  className="shrink-0"
                >
                  {phone$.isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-green-400">✓ OTP sent to +91 {phone$.sentPhone}</p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    className="flex-1 tracking-widest text-center text-lg"
                    autoFocus
                  />
                  <Button
                    onClick={handleConfirmOtp}
                    disabled={phone$.isVerifying || otp.length < 6}
                    className="shrink-0"
                  >
                    {phone$.isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                  </Button>
                </div>
                <button
                  onClick={() => { phone$.reset(); setOtp(""); }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Wrong number? Change it
                </button>
              </div>
            )}

            {/* Invisible reCAPTCHA anchor */}
            <div id="recaptcha-signup" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign in link */}
      <motion.p variants={item} className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  );
}
