import { create } from "zustand";
import type { ChatMessage, InterviewConfig } from "@/types/interview";

interface InterviewState {
  // Session
  sessionId: string | null;
  config: InterviewConfig | null;

  // Messages
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;

  // Timer
  elapsedSeconds: number;
  isTimerRunning: boolean;

  // Code editor
  editorCode: string;
  editorLanguage: string;

  // Code execution
  executionOutput: string;
  executionError: string;
  executionTime: number | null;
  isExecuting: boolean;

  // Actions
  setSession: (sessionId: string, config: InterviewConfig) => void;
  addMessage: (message: ChatMessage) => void;
  setStreaming: (streaming: boolean) => void;
  appendStreamingContent: (chunk: string) => void;
  finalizeStreamingMessage: () => void;
  clearStreamingContent: () => void;
  incrementTimer: () => void;
  setTimerRunning: (running: boolean) => void;
  setEditorCode: (code: string) => void;
  setEditorLanguage: (lang: string) => void;
  setExecutionResult: (output: string, error: string, time: number) => void;
  setExecuting: (executing: boolean) => void;
  clearExecution: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  sessionId: null as string | null,
  config: null as InterviewConfig | null,
  messages: [] as ChatMessage[],
  isStreaming: false,
  streamingContent: "",
  elapsedSeconds: 0,
  isTimerRunning: false,
  editorCode: "",
  editorLanguage: "python",
  executionOutput: "",
  executionError: "",
  executionTime: null as number | null,
  isExecuting: false,
};

export const useInterviewStore = create<InterviewState>((set, get) => ({
  ...INITIAL_STATE,

  setSession: (sessionId, config) => set({ sessionId, config }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  appendStreamingContent: (chunk) =>
    set((state) => ({
      streamingContent: state.streamingContent + chunk,
    })),

  finalizeStreamingMessage: () => {
    const { streamingContent } = get();
    if (!streamingContent) return;

    const message: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: streamingContent,
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, message],
      streamingContent: "",
      isStreaming: false,
    }));
  },

  clearStreamingContent: () => set({ streamingContent: "" }),

  incrementTimer: () =>
    set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),

  setTimerRunning: (running) => set({ isTimerRunning: running }),

  setEditorCode: (code) => set({ editorCode: code }),

  setEditorLanguage: (lang) => set({ editorLanguage: lang }),

  setExecutionResult: (output, error, time) =>
    set({ executionOutput: output, executionError: error, executionTime: time }),

  setExecuting: (executing) => set({ isExecuting: executing }),

  clearExecution: () =>
    set({ executionOutput: "", executionError: "", executionTime: null }),

  reset: () => set({ ...INITIAL_STATE }),
}));
