"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Reads error param from URL and surfaces it as a toast.
// Must be wrapped in Suspense because useSearchParams opts into dynamic rendering.
function AuthErrorHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_callback_failed") {
      toast.error("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  return null;
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const supabase = createClient();
  const isLoading = emailLoading || googleLoading;

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // Browser navigates away on success; loading stays true until redirect
    } catch {
      toast.error("Failed to sign in with Google. Please try again.");
      setGoogleLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMagicLinkSent(true);
      toast.success("Magic link sent. Check your inbox.");
    } catch {
      toast.error("Failed to send magic link. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface border border-border rounded-2xl p-8 shadow-2xl shadow-black/60"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-primary mb-4 shadow-lg shadow-brand-primary/30">
            <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            CracktheRole
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            AI-powered interview preparation
          </p>
        </div>

        {/* Google */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 border-border bg-transparent text-text-primary hover:bg-surface2 hover:text-text-primary gap-3 font-medium"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          {googleLoading ? "Redirecting..." : "Continue with Google"}
        </Button>

        {/* Divider */}
        <div className="relative my-6 flex items-center">
          <Separator className="flex-1 bg-border" />
          <span className="mx-3 text-xs text-text-secondary whitespace-nowrap">
            or continue with email
          </span>
          <Separator className="flex-1 bg-border" />
        </div>

        {/* Magic link */}
        {magicLinkSent ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-4"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface2 mb-4">
              <Mail className="w-6 h-6 text-brand-primary-light" />
            </div>
            <p className="text-text-primary font-semibold">Check your inbox</p>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              We sent a magic link to{" "}
              <span className="text-text-primary font-medium">{email}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setMagicLinkSent(false);
                setEmail("");
              }}
              className="text-sm text-brand-primary-light hover:underline underline-offset-2 mt-4 block mx-auto"
            >
              Use a different email
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm text-text-secondary font-normal"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11 bg-surface2 border-border text-text-primary placeholder:text-text-secondary/50 focus-visible:ring-brand-primary/50"
                autoComplete="email"
                autoFocus
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium shadow-lg shadow-brand-primary/25"
              disabled={isLoading}
            >
              {emailLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Magic Link"
              )}
            </Button>
          </form>
        )}
      </motion.div>

      <p className="text-center text-xs text-text-secondary/70 mt-6 leading-relaxed">
        By continuing, you agree to our{" "}
        <a
          href="#"
          className="text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      {/* Floating ambient orbs */}
      <motion.div
        className="absolute top-[-15%] left-[-8%] w-[640px] h-[640px] rounded-full pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(circle, rgba(108,60,225,0.18) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 45, 0], y: [0, 28, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-12%] right-[-6%] w-[720px] h-[720px] rounded-full pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(circle, rgba(6,182,212,0.11) 0%, transparent 70%)",
        }}
        animate={{ x: [0, -32, 0], y: [0, -22, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[38%] right-[18%] w-[360px] h-[360px] rounded-full pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)",
        }}
        animate={{ x: [0, -18, 0], y: [0, 25, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Error handler needs Suspense because it uses useSearchParams */}
      <Suspense>
        <AuthErrorHandler />
      </Suspense>

      <LoginForm />
    </main>
  );
}
