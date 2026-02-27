export const APP_NAME = "CracktheRole";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const JOB_ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Mobile Engineer",
  "DevOps Engineer",
  "Data Engineer",
  "Machine Learning Engineer",
  "Engineering Manager",
  "Staff Engineer",
  "Principal Engineer",
] as const;

export const DIFFICULTY_LEVELS = [
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid-level (2-5 years)" },
  { value: "senior", label: "Senior (5+ years)" },
  { value: "staff", label: "Staff (8+ years)" },
] as const;

export const INTERVIEW_TYPES = [
  { value: "behavioral", label: "Behavioral" },
  { value: "technical", label: "Technical" },
  { value: "system-design", label: "System Design" },
  { value: "coding", label: "Coding" },
  { value: "mixed", label: "Mixed" },
] as const;

export const MAX_INTERVIEW_DURATION_MINUTES = 60;

export const SCORE_THRESHOLDS = {
  excellent: 85,
  good: 70,
  average: 55,
  needsWork: 0,
} as const;
