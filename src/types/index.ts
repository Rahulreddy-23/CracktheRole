export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  plan: "free" | "pro";
  interviewsCompleted: number;
  resumesBuilt: number;
  createdAt: Date;
}

export interface InterviewSession {
  id: string;
  userId: string;
  type: "coding" | "system-design" | "behavioral";
  difficulty: "easy" | "medium" | "hard";
  language: string;
  topic: string;
  status: "in-progress" | "completed" | "abandoned";
  problem: InterviewProblem;
  messages: ChatMessage[];
  code: string;
  codeOutput?: CodeExecutionResult;
  feedback?: InterviewFeedback;
  startedAt: Date;
  completedAt?: Date;
}

export interface InterviewProblem {
  title: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hints: string[];
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface CodeExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

export interface InterviewFeedback {
  overallScore: number;
  categories: {
    problemSolving: { score: number; feedback: string };
    codeQuality: { score: number; feedback: string };
    communication: { score: number; feedback: string };
    timeComplexity: { score: number; feedback: string };
    edgeCases: { score: number; feedback: string };
  };
  strengths: string[];
  improvements: string[];
  mistakesLog: { mistake: string; correction: string; severity: "minor" | "major" | "critical" }[];
  summary: string;
}

export interface ResumeData {
  id: string;
  userId: string;
  type: "tailor" | "scratch";
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    location: string;
  };
  summary: string;
  experience: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }[];
  skills: { category: string; items: string[] }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }[];
  certifications: { name: string; issuer: string; date: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export type SupportedLanguage =
  | "python"
  | "javascript"
  | "typescript"
  | "java"
  | "c"
  | "cpp"
  | "csharp"
  | "sql"
  | "go"
  | "rust"
  | "swift";

export const LANGUAGE_CONFIG: Record<
  SupportedLanguage,
  { id: number; name: string; monacoId: string; extension: string }
> = {
  python: { id: 71, name: "Python 3", monacoId: "python", extension: "py" },
  javascript: { id: 63, name: "JavaScript", monacoId: "javascript", extension: "js" },
  typescript: { id: 74, name: "TypeScript", monacoId: "typescript", extension: "ts" },
  java: { id: 62, name: "Java", monacoId: "java", extension: "java" },
  c: { id: 50, name: "C (GCC)", monacoId: "c", extension: "c" },
  cpp: { id: 54, name: "C++ (GCC)", monacoId: "cpp", extension: "cpp" },
  csharp: { id: 51, name: "C#", monacoId: "csharp", extension: "cs" },
  sql: { id: 82, name: "SQL", monacoId: "sql", extension: "sql" },
  go: { id: 60, name: "Go", monacoId: "go", extension: "go" },
  rust: { id: 73, name: "Rust", monacoId: "rust", extension: "rs" },
  swift: { id: 83, name: "Swift", monacoId: "swift", extension: "swift" },
};
