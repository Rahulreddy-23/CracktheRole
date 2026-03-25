export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  plan: "free" | "pro";
  interviewsUsed: number;
  resumesUsed: number;
  interviewsLimit: number;
  resumesLimit: number;
  planExpiresAt?: Date;
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
  maxDurationMinutes: number;
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
  status: string;
  executionTime: string | null;
  memoryUsed: number | null;
  language: string;
  version: string;
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
  isPaidDownload: boolean;
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
  | "rust";

// Judge0 CE language config — judge0Id maps to Judge0 CE language IDs
// https://ce.judge0.com/languages/
export const LANGUAGE_CONFIG: Record<
  SupportedLanguage,
  { judge0Id: string; judge0Version: string; name: string; monacoId: string; extension: string }
> = {
  python:     { judge0Id: "python",     judge0Version: "3.10.0",  name: "Python 3",    monacoId: "python",     extension: "py"   },
  javascript: { judge0Id: "javascript", judge0Version: "18.15.0", name: "JavaScript",  monacoId: "javascript", extension: "js"   },
  typescript: { judge0Id: "typescript", judge0Version: "5.0.3",   name: "TypeScript",  monacoId: "typescript", extension: "ts"   },
  java:       { judge0Id: "java",       judge0Version: "15.0.2",  name: "Java",        monacoId: "java",       extension: "java" },
  c:          { judge0Id: "c",          judge0Version: "10.2.0",  name: "C (GCC)",     monacoId: "c",          extension: "c"    },
  cpp:        { judge0Id: "c++",        judge0Version: "10.2.0",  name: "C++ (GCC)",   monacoId: "cpp",        extension: "cpp"  },
  csharp:     { judge0Id: "csharp",     judge0Version: "6.12.0",  name: "C#",          monacoId: "csharp",     extension: "cs"   },
  sql:        { judge0Id: "sqlite3",    judge0Version: "browser", name: "SQL (SQLite)", monacoId: "sql",       extension: "sql"  },
  go:         { judge0Id: "go",         judge0Version: "1.16.2",  name: "Go",          monacoId: "go",         extension: "go"   },
  rust:       { judge0Id: "rust",       judge0Version: "1.68.2",  name: "Rust",        monacoId: "rust",       extension: "rs"   },
};

// NOTE: SQL uses sql.js (SQLite compiled to WebAssembly) running in the browser.
// judge0Version "browser" is a sentinel — SQL never reaches the Judge0 endpoint.
