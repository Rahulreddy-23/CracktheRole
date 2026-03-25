"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserDocument, getUserDocument } from "@/lib/db";
import type { User } from "@/types";

// ── Context shape ─────────────────────────────────────────────────────────

interface AuthContextValue {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  refreshProfile: async () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async (uid?: string) => {
    const targetUid = uid ?? user?.uid;
    if (!targetUid) return;
    try {
      const profile = await getUserDocument(targetUid);
      setUserProfile(profile as User | null);
    } catch (err) {
      console.error("refreshProfile:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);

          // Fetch or create the Firestore profile
          let profile = await getUserDocument(firebaseUser.uid);
          if (!profile) {
            await createUserDocument(firebaseUser);
            profile = await getUserDocument(firebaseUser.uid);
          }
          setUserProfile(profile as User | null);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Auth error");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, error, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}
