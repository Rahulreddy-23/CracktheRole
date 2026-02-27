"use client";

// This hook is deprecated. Interview chat functionality
// is now handled directly in ChatInterface.tsx via the
// Zustand store (interview-store.ts). Keeping this file
// to avoid breaking any remaining imports.

export { useInterviewStore } from "@/stores/interview-store";
