import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";
import { db } from "./firebase";
import type { InterviewSession, ResumeData } from "@/types";

// ── Users ──────────────────────────────────────────────────────────────────

export async function createUserDocument(user: FirebaseUser) {
  const ref = doc(db, "users", user.uid);

  // Always merge login metadata — safe for both new users and re-logins.
  // Using setDoc+merge avoids the getDoc+conditional-setDoc race condition
  // when multiple tabs sign in simultaneously.
  await setDoc(
    ref,
    {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      phoneNumber: user.phoneNumber ?? null,
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Set free-tier defaults only on first sign-up (no plan field yet).
  // Never overwrites plan/limits set by payment activation.
  const snap = await getDoc(ref);
  if (snap.exists() && !snap.data().plan) {
    await updateDoc(ref, {
      plan: "free",
      interviewsUsed: 0,
      resumesUsed: 0,
      interviewsLimit: 1,
      resumesLimit: 1,
      createdAt: serverTimestamp(),
    });
  }
}

export async function getUserDocument(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function updateUserStats(
  uid: string,
  field: "interviewsUsed" | "resumesUsed"
) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { [field]: increment(1) });
}

export async function updateUserPlan(
  uid: string,
  plan: string,
  limits: {
    interviewsLimit: number;
    resumesLimit: number;
    resumeDownloadsLeft?: number;
  }
) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    plan,
    interviewsLimit: limits.interviewsLimit,
    resumesLimit: limits.resumesLimit,
    ...(limits.resumeDownloadsLeft !== undefined && {
      resumeDownloadsLeft: limits.resumeDownloadsLeft,
    }),
  });
}

// ── Interviews ────────────────────────────────────────────────────────────

export async function saveInterviewSession(session: InterviewSession) {
  const ref = doc(db, "interviews", session.id);
  await setDoc(ref, session, { merge: true });
}

export async function getInterviewSession(sessionId: string) {
  const ref = doc(db, "interviews", sessionId);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as InterviewSession) : null;
}

export async function updateInterviewCode(sessionId: string, code: string) {
  const ref = doc(db, "interviews", sessionId);
  await updateDoc(ref, { code });
}

export async function updateInterviewStatus(
  sessionId: string,
  status: InterviewSession["status"],
  extra?: Partial<InterviewSession>
) {
  const ref = doc(db, "interviews", sessionId);
  await updateDoc(ref, { status, ...extra });
}

export async function getInterviewHistory(userId: string, limitCount = 20) {
  const q = query(
    collection(db, "interviews"),
    where("userId", "==", userId),
    orderBy("startedAt", "desc"),
    firestoreLimit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Resumes ───────────────────────────────────────────────────────────────

export async function saveResumeData(resume: ResumeData) {
  const ref = doc(db, "resumes", resume.id);
  await setDoc(ref, resume, { merge: true });
}

export async function getUserResumes(userId: string) {
  const q = query(
    collection(db, "resumes"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Payments ──────────────────────────────────────────────────────────────

export async function recordPayment(
  userId: string,
  paymentData: {
    orderId: string;
    paymentId: string;
    amount: number;
    gstAmount: number;
    packType: string;
    status: string;
  }
) {
  await addDoc(collection(db, "payments"), {
    userId,
    ...paymentData,
    createdAt: serverTimestamp(),
  });
}
