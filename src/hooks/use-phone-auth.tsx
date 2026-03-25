"use client";

import { useRef, useState, useCallback } from "react";
import { RecaptchaVerifier, type ConfirmationResult } from "firebase/auth";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { signInWithPhone } from "@/lib/auth";

// ── Types ──────────────────────────────────────────────────────────────────

export type PhoneAuthState =
  | { stage: "idle" }
  | { stage: "sending" }
  | { stage: "otp_ready"; phone: string }
  | { stage: "verifying" };

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * Shared hook for phone OTP authentication.
 * Handles reCAPTCHA lifecycle, OTP send, and OTP confirmation.
 * Used on both the login and signup pages to keep the logic DRY.
 *
 * @param recaptchaContainerId - The HTML element ID that will anchor the
 *   invisible reCAPTCHA widget. Must be unique per page.
 */
export function usePhoneAuth(recaptchaContainerId: string) {
  const [state, setState] = useState<PhoneAuthState>({ stage: "idle" });
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmRef  = useRef<ConfirmationResult | null>(null);
  const sentPhoneRef = useRef<string>(""); // track phone across state transitions

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Destroy existing verifier and create a fresh one. */
  function buildVerifier(): RecaptchaVerifier {
    if (verifierRef.current) {
      try { verifierRef.current.clear(); } catch { /* already cleared */ }
      verifierRef.current = null;
    }
    const container = document.getElementById(recaptchaContainerId);
    if (!container) throw new Error(`reCAPTCHA container #${recaptchaContainerId} not found`);
    const v = new RecaptchaVerifier(auth, container, { size: "invisible" });
    verifierRef.current = v;
    return v;
  }

  /** Call on component unmount to release reCAPTCHA resources. */
  const cleanup = useCallback(() => {
    if (verifierRef.current) {
      try { verifierRef.current.clear(); } catch { /* ignore */ }
      verifierRef.current = null;
    }
  }, []);

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Send OTP to the given 10-digit Indian phone number (without +91).
   * Returns `true` on success, `false` on error (error is toasted internally).
   */
  const sendOtp = useCallback(
    async (phone: string): Promise<boolean> => {
      const digits = phone.replace(/\D/g, "");
      if (digits.length !== 10) {
        toast.error("Please enter a valid 10-digit mobile number.");
        return false;
      }
      setState({ stage: "sending" });
      try {
        const verifier = buildVerifier();
        const result = await signInWithPhone(`+91${digits}`, verifier);
        confirmRef.current = result;
        sentPhoneRef.current = digits;
        setState({ stage: "otp_ready", phone: digits });
        toast.success("OTP sent to your number!");
        return true;
      } catch (e: unknown) {
        const code = (e as { code?: string }).code ?? "";
        toast.error(friendlyPhoneError(code));
        setState({ stage: "idle" });
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recaptchaContainerId]
  );

  /**
   * Verify the OTP entered by the user.
   * Resolves with the Firebase `UserCredential` on success, or `null` on error.
   */
  const verifyOtp = useCallback(async (otp: string) => {
    if (!confirmRef.current) {
      toast.error("Session expired. Please request a new OTP.");
      setState({ stage: "idle" });
      return null;
    }
    setState({ stage: "verifying" });
    try {
      const cred = await confirmRef.current.confirm(otp);
      return cred;
    } catch {
      toast.error("Invalid OTP. Please try again.");
      // Restore otp_ready so user can retry — use the ref to preserve phone
      setState({ stage: "otp_ready", phone: sentPhoneRef.current });
      return null;
    }
  }, []);

  /** Reset back to idle (e.g. "Wrong number? Change it"). */
  const reset = useCallback(() => {
    confirmRef.current = null;
    setState({ stage: "idle" });
  }, []);

  // Derived convenience flags
  const isSending   = state.stage === "sending";
  const isVerifying = state.stage === "verifying";
  const isOtpReady  = state.stage === "otp_ready";
  const sentPhone   = state.stage === "otp_ready" ? state.phone : "";

  return { state, isSending, isVerifying, isOtpReady, sentPhone, sendOtp, verifyOtp, reset, cleanup };
}

// ── Error map ──────────────────────────────────────────────────────────────

const PHONE_ERRORS: Record<string, string> = {
  "auth/invalid-phone-number": "Invalid phone number. Please check and try again.",
  "auth/too-many-requests":    "Too many attempts. Please try again later.",
  "auth/quota-exceeded":       "SMS quota exceeded. Try again later.",
  "auth/captcha-check-failed": "reCAPTCHA check failed. Please refresh and retry.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/missing-phone-number": "Phone number is required.",
};

function friendlyPhoneError(code: string) {
  return PHONE_ERRORS[code] ?? "Failed to send OTP. Please try again.";
}
