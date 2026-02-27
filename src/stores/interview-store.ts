import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  InterviewConfig,
  InterviewMessage,
  InterviewScore,
  InterviewStatus,
} from "@/types/interview";

interface InterviewState {
  config: InterviewConfig | null;
  messages: InterviewMessage[];
  score: InterviewScore | null;
  status: InterviewStatus;
  isLoading: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
}

interface InterviewActions {
  setConfig: (config: InterviewConfig) => void;
  addMessage: (message: InterviewMessage) => void;
  setScore: (score: InterviewScore) => void;
  setLoading: (loading: boolean) => void;
  setStatus: (status: InterviewStatus) => void;
  startInterview: () => void;
  completeInterview: () => void;
  resetInterview: () => void;
}

const initialState: InterviewState = {
  config: null,
  messages: [],
  score: null,
  status: "pending",
  isLoading: false,
  startedAt: null,
  completedAt: null,
};

export const useInterviewStore = create<InterviewState & InterviewActions>()(
  persist(
    (set) => ({
      ...initialState,

      setConfig: (config) => set({ config }),

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      setScore: (score) => set({ score }),

      setLoading: (isLoading) => set({ isLoading }),

      setStatus: (status) => set({ status }),

      startInterview: () =>
        set({ status: "in_progress", startedAt: new Date() }),

      completeInterview: () =>
        set({ status: "completed", completedAt: new Date() }),

      resetInterview: () => set(initialState),
    }),
    {
      name: "interview-session",
      partialize: (state) => ({
        config: state.config,
        messages: state.messages,
        score: state.score,
        status: state.status,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
      }),
    }
  )
);
