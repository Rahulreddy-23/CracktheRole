import { NextRequest, NextResponse } from "next/server";
import { callClaudeWithTool } from "@/lib/claude";
import type { ResumeData } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert resume writer and career coach. Your task is to analyze a candidate's resume against a job description and produce a tailored, ATS-optimized version.

INSTRUCTIONS:
1. Extract and restructure the candidate's existing experience to highlight relevance to the JD.
2. Rewrite bullet points using strong action verbs and quantified achievements where possible.
3. Identify matched keywords (in both resume and JD) and missing keywords (in JD but not in resume).
4. Calculate a matchScore (0-100) based on skills, experience, and keyword overlap.
5. Return a "tailoredResume" object matching the ResumeData shape, "matchScore", "improvements" array, "matchedKeywords" array, and "missingKeywords" array.`;

interface TailorRequest {
  jobDescription: string;
  resumeText: string;
}

interface TailorResponse {
  matchScore: number;
  tailoredResume: Partial<ResumeData>;
  improvements: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

const TAILOR_TOOL = {
  name: "produce_tailored_resume",
  description:
    "Produce a tailored, ATS-optimized resume with match analysis for a given job description.",
  input_schema: {
    type: "object" as const,
    properties: {
      matchScore: {
        type: "number",
        description: "0-100 score based on skills, experience, and keyword overlap",
      },
      tailoredResume: {
        type: "object",
        description: "Tailored resume matching the ResumeData shape",
        properties: {
          personalInfo: {
            type: "object",
            properties: {
              fullName: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              linkedin: { type: "string" },
              github: { type: "string" },
              portfolio: { type: "string" },
              location: { type: "string" },
            },
          },
          summary: { type: "string" },
          experience: {
            type: "array",
            items: {
              type: "object",
              properties: {
                company: { type: "string" },
                role: { type: "string" },
                startDate: { type: "string" },
                endDate: { type: "string" },
                current: { type: "boolean" },
                bullets: { type: "array", items: { type: "string" } },
              },
            },
          },
          education: {
            type: "array",
            items: {
              type: "object",
              properties: {
                institution: { type: "string" },
                degree: { type: "string" },
                field: { type: "string" },
                startDate: { type: "string" },
                endDate: { type: "string" },
                gpa: { type: "string" },
              },
            },
          },
          skills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                items: { type: "array", items: { type: "string" } },
              },
            },
          },
          projects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                technologies: { type: "array", items: { type: "string" } },
                link: { type: "string" },
              },
            },
          },
          certifications: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                issuer: { type: "string" },
                date: { type: "string" },
              },
            },
          },
        },
      },
      improvements: {
        type: "array",
        items: { type: "string" },
        description: "List of specific improvements made to the resume",
      },
      matchedKeywords: {
        type: "array",
        items: { type: "string" },
        description: "Keywords present in both the resume and the job description",
      },
      missingKeywords: {
        type: "array",
        items: { type: "string" },
        description: "Keywords from the job description missing in the resume",
      },
    },
    required: [
      "matchScore",
      "tailoredResume",
      "improvements",
      "matchedKeywords",
      "missingKeywords",
    ],
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TailorRequest;
    const { jobDescription, resumeText } = body;

    if (!jobDescription?.trim() || !resumeText?.trim()) {
      return NextResponse.json({ error: "jobDescription and resumeText are required" }, { status: 400 });
    }

    const userMessage = `JOB DESCRIPTION:
${jobDescription.slice(0, 8000)}

---

CANDIDATE'S RESUME:
${resumeText.slice(0, 8000)}

---

Tailor the resume for this job description and provide your analysis.`;

    const result = await callClaudeWithTool<TailorResponse>(
      SYSTEM_PROMPT,
      userMessage,
      TAILOR_TOOL,
      { maxTokens: 8192 }
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("[resume/tailor]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
