export type InterviewDifficulty = "junior" | "mid" | "senior" | "staff";

export type InterviewType =
  | "behavioral"
  | "technical"
  | "system-design"
  | "coding"
  | "mixed";

export type InterviewStatus = "pending" | "in_progress" | "completed";

export interface InterviewMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface InterviewConfig {
  jobRole: string;
  difficulty: InterviewDifficulty;
  interviewType: InterviewType;
  targetCompany?: string;
  durationMinutes: number;
}

export interface InterviewScore {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
}

export interface InterviewSession {
  id: string;
  config: InterviewConfig;
  messages: InterviewMessage[];
  score: InterviewScore | null;
  status: InterviewStatus;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface SalaryData {
  median: number;
  low: number;
  high: number;
  currency: string;
  marketTrend: "rising" | "stable" | "declining";
  insights: string[];
}
