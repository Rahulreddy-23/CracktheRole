"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface UserContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
  initialUser: User;
  initialProfile: Profile | null;
  children: React.ReactNode;
}

export function UserProvider({
  initialUser,
  initialProfile,
  children,
}: UserProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Use a ref so the supabase client instance is stable across renders
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }

      if (event === "SIGNED_OUT") {
        // Full page reload to clear all client state and avoid stuck transitions
        window.location.href = "/login";
        return;
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabaseRef.current.auth.signOut();
      if (error) throw error;
    } catch {
      toast.error("Failed to sign out. Please try again.");
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, signOut }),
    [user, profile, loading, signOut]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return ctx;
}
