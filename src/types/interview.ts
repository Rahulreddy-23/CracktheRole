export type InterviewType = "dsa" | "system_design" | "behavioral" | "sql";

export type InterviewDifficulty = "easy" | "medium" | "hard";

export type InterviewStatus = "in_progress" | "completed" | "abandoned";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface InterviewConfig {
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  companyContext: string | null;
  durationMinutes: number;
}

export interface InterviewScore {
  score_technical: number;
  score_communication: number;
  score_problem_solving: number;
  score_time_management: number;
  overall_score: number;
  feedback_summary: string;
  strengths: string[];
  improvements: string[];
}
