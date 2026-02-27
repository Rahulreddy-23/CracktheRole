import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface UserState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

interface UserActions {
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState & UserActions>((set) => ({
  user: null,
  profile: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ profile }),

  setLoading: (isLoading) => set({ isLoading }),

  clearUser: () => set({ user: null, profile: null }),
}));
