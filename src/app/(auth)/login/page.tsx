"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Eye, EyeOff, Loader2, Phone, Mail, Link2 } from "lucide-react";
import { type ConfirmationResult } from "firebase/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  signInWithEmail,
  signInWithGoogle,
  resetPassword,
  sendMagicLink,
  isMagicLink,
  confirmMagicLink,
  confirmMagicLinkWithEmail,
} from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { usePhoneAuth } from "@/hooks/use-phone-auth";

// ── Firebase error → friendly message ─────────────────────────────────────

const AUTH_ERRORS: Record<string, string> = {
  "auth/user-not-found":           "No account found with this email.",
  "auth/wrong-password":           "Incorrect password. Please try again.",
  "auth/invalid-credential":       "Invalid email or password.",
  "auth/email-already-in-use":     "An account with this email already exists.",
  "auth/weak-password":            "Password must be at least 6 characters.",
  "auth/invalid-email":            "Please enter a valid email address.",
  "auth/too-many-requests":        "Too many attempts. Please try again later.",
  "auth/popup-closed-by-user":     "Sign-in popup was closed. Please try again.",
  "auth/network-request-failed":   "Network error. Check your connection.",
  "auth/unauthorized-domain":      "This email domain is not allowed for sign-in.",
};

function friendlyError(code: string) {
  return AUTH_ERRORS[code] ?? "Something went wrong. Please try again.";
}

// ── Animation variants ─────────────────────────────────────────────────────

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

// ── Component ──────────────────────────────────────────────────────────────

type AuthTab = "email" | "phone" | "magic";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect already-authenticated users
  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [user, authLoading, router]);

  // ── Tab state ──
  const [tab, setTab] = useState<AuthTab>("email");

  // ── Email/password ──
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // ── Forgot password ──
  const [fpOpen, setFpOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  // ── Phone OTP (shared hook) ──
  const phone$ = usePhoneAuth("recaptcha-login");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  // ── Magic link ──
  const [mlEmail, setMlEmail] = useState("");
  const [loadingMagic, setLoadingMagic] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  // Cross-device: user must re-enter email
  const [needEmailPrompt, setNeedEmailPrompt] = useState(false);
  const [promptEmail, setPromptEmail] = useState("");

  // ── Detect incoming magic link on mount ───────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (!isMagicLink(url)) return;

    (async () => {
      try {
        await confirmMagicLink(url);
        toast.success("Signed in successfully!");
        router.replace("/dashboard");
      } catch (e: unknown) {
        const code = (e as { code?: string }).code ?? "";
        if (code === "auth/email-required") {
          // Cross-device: need user to re-enter email
          setNeedEmailPrompt(true);
        } else {
          toast.error(friendlyError(code));
        }
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleGoogle() {
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
      router.replace("/dashboard");
    } catch (e: unknown) {
      toast.error(friendlyError((e as { code?: string }).code ?? ""));
    } finally {
      setLoadingGoogle(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoadingEmail(true);
    try {
      await signInWithEmail(email, password);
      router.replace("/dashboard");
    } catch (e: unknown) {
      toast.error(friendlyError((e as { code?: string }).code ?? ""));
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleForgotPassword() {
    if (!fpEmail) return;
    setFpLoading(true);
    try {
      await resetPassword(fpEmail);
      toast.success("Password reset email sent!");
      setFpOpen(false);
    } catch (e: unknown) {
      toast.error(friendlyError((e as { code?: string }).code ?? ""));
    } finally {
      setFpLoading(false);
    }
  }

  async function handleSendOtp() {
    const sent = await phone$.sendOtp(phone);
    if (sent) setOtp(""); // clear stale OTP field
  }

  async function handleConfirmOtp() {
    const cred = await phone$.verifyOtp(otp);
    if (cred) router.replace("/dashboard");
  }

  async function handleSendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!mlEmail) return;
    setLoadingMagic(true);
    try {
      const redirectUrl = `${window.location.origin}/login`;
      await sendMagicLink(mlEmail, redirectUrl);
      setMagicSent(true);
      toast.success("Magic link sent! Check your inbox.");
    } catch (e: unknown) {
      toast.error(friendlyError((e as { code?: string }).code ?? ""));
    } finally {
      setLoadingMagic(false);
    }
  }

  async function handlePromptEmailConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!promptEmail) return;
    setLoadingMagic(true);
    try {
      await confirmMagicLinkWithEmail(promptEmail, window.location.href);
      toast.success("Signed in successfully!");
      router.replace("/dashboard");
    } catch (e: unknown) {
      toast.error(friendlyError((e as { code?: string }).code ?? ""));
    } finally {
      setLoadingMagic(false);
    }
  }

  if (authLoading) return null;

  // ── Cross-device email prompt (full-page takeover) ─────────────────────
  if (needEmailPrompt) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Confirm your email</h1>
          <p className="text-sm text-muted-foreground">
            It looks like you opened this link on a different device. Please re-enter the
            email address you used to request the sign-in link.
          </p>
        </div>
        <form onSubmit={handlePromptEmailConfirm} className="space-y-4">
          <Input
            type="email"
            placeholder="you@example.com"
            value={promptEmail}
            onChange={(e) => setPromptEmail(e.target.value)}
            required
            autoFocus
          />
          <Button type="submit" className="w-full h-11" disabled={loadingMagic || !promptEmail}>
            {loadingMagic ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Sign In"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Wrong link?{" "}
          <button
            onClick={() => setNeedEmailPrompt(false)}
            className="text-primary hover:underline font-medium"
          >
            Go back
          </button>
        </p>
      </motion.div>
    );
  }

  // ── Main login form ────────────────────────────────────────────────────

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Heading */}
      <motion.div variants={item} className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to continue your prep</p>
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
            { id: "magic", icon: Link2, label: "Magic Link" },
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

      {/* ── Email / Password Tab ── */}
      <AnimatePresence mode="wait">
        {tab === "email" && (
          <motion.form
            key="email"
            variants={expand}
            initial="hidden"
            animate="show"
            exit="exit"
            onSubmit={handleEmailLogin}
            className="space-y-4 overflow-hidden"
          >
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <button
                  type="button"
                  onClick={() => setFpOpen(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
            </div>

            <Button type="submit" className="w-full h-11" disabled={loadingEmail}>
              {loadingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
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
              Enter your Indian mobile number (+91). We&apos;ll send a 6-digit OTP.
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
                  onChange={(e) => setPhone(e.target.value)}
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
                <p className="text-xs text-green-400">
                  ✓ OTP sent to +91 {phone$.sentPhone}
                </p>
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
            <div id="recaptcha-login" />
          </motion.div>
        )}

        {/* ── Magic Link Tab ── */}
        {tab === "magic" && (
          <motion.div
            key="magic"
            variants={expand}
            initial="hidden"
            animate="show"
            exit="exit"
            className="space-y-3 overflow-hidden"
          >
            {!magicSent ? (
              <>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll email you a one-click sign-in link — no password needed.
                </p>
                <form onSubmit={handleSendMagicLink} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={mlEmail}
                    onChange={(e) => setMlEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loadingMagic || !mlEmail} className="shrink-0">
                    {loadingMagic ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Link"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Check your inbox! 📬</p>
                <p className="text-xs text-muted-foreground">
                  We sent a sign-in link to <span className="text-foreground font-medium">{mlEmail}</span>.
                  Click it from the same browser to sign in instantly, or enter your email again if
                  opening from a different device.
                </p>
                <button
                  onClick={() => { setMagicSent(false); setMlEmail(""); }}
                  className="text-xs text-primary hover:underline"
                >
                  Send to a different email
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign up link */}
      <motion.p variants={item} className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </motion.p>

      {/* Forgot password dialog */}
      <Dialog open={fpOpen} onOpenChange={setFpOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email and we&apos;ll send you a reset link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
            />
            <Button className="w-full" onClick={handleForgotPassword} disabled={fpLoading || !fpEmail}>
              {fpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
