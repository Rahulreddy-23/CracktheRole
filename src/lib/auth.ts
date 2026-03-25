import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "./firebase";

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export async function signInWithPhone(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

export async function signOutUser() {
  return signOut(auth);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

// ── Email Magic Link (passwordless) ────────────────────────────────────────

const EMAIL_KEY = "emailForSignIn";

/**
 * Domain allowlist for magic-link sign-in.
 * Add any domains you want to accept. Wildcard subdomains are NOT supported
 * here — add each subdomain explicitly if needed.
 *
 * Empty array = allow all domains (open to any email).
 * Non-empty = only listed domains are accepted.
 */
const ALLOWED_EMAIL_DOMAINS: string[] = [
  // e.g. "yourcompany.com", "partner.org"
  // Leave empty to allow all domains during development
];

function isDomainAllowed(email: string): boolean {
  if (ALLOWED_EMAIL_DOMAINS.length === 0) return true; // open
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
}

export async function sendMagicLink(email: string, redirectUrl: string) {
  if (!isDomainAllowed(email)) {
    throw Object.assign(
      new Error("This email domain is not allowed for sign-in."),
      { code: "auth/unauthorized-domain" }
    );
  }
  const actionCodeSettings = {
    url: redirectUrl,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  // Persist email so confirmation works on same browser/device
  localStorage.setItem(EMAIL_KEY, email);
}

export function isMagicLink(url: string): boolean {
  return isSignInWithEmailLink(auth, url);
}

/**
 * Confirm sign-in from a magic link URL.
 * Returns the stored email if found, or throws a special error so the caller
 * can prompt the user to re-enter their email (cross-device flow).
 */
export async function confirmMagicLink(url: string) {
  let email = localStorage.getItem(EMAIL_KEY) ?? "";
  if (!email) {
    // Cross-device: caller must supply the email via the returned flag
    throw Object.assign(new Error("email-required"), { code: "auth/email-required" });
  }
  const credential = await signInWithEmailLink(auth, email, url);
  localStorage.removeItem(EMAIL_KEY);
  return credential;
}

/**
 * Confirm magic link when the user had to manually re-enter their email
 * (cross-device / cross-browser scenario).
 */
export async function confirmMagicLinkWithEmail(email: string, url: string) {
  const credential = await signInWithEmailLink(auth, email, url);
  localStorage.removeItem(EMAIL_KEY);
  return credential;
}
