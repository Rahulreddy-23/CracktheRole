import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminDb = getFirestore();
export { FieldValue };

/**
 * Verifies a Firebase ID token and returns the authenticated user's UID.
 * Throws if the token is missing or invalid.
 */
export async function verifyAuthToken(token: string | null | undefined): Promise<string> {
  if (!token) throw new Error("Missing auth token");
  const decoded = await getAuth().verifyIdToken(token);
  return decoded.uid;
}
