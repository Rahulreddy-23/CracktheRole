import { NextRequest, NextResponse } from "next/server";
import { callClaude, extractJSON } from "@/lib/claude";
import type { ResumeData } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert resume writer and career coach. Your task is to analyze a candidate's resume against a job description and produce a tailored, ATS-optimized version.

INSTRUCTIONS:
1. Extract and restructure the candidate's existing experience to highlight relevance to the JD.
2. Rewrite bullet points using strong action verbs and quantified achievements where possible.
3. Identify matched keywords (in both resume and JD) and missing keywords (in JD but not in resume).
4. Calculate a matchScore (0-100) based on skills, experience, and keyword overlap.
5. Return a "tailoredResume" object matching the ResumeData shape, "matchScore", "improvements" array, "matchedKeywords" array, and "missingKeywords" array.

Return ONLY valid JSON. No markdown, no explanations outside the JSON.`;

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

Produce a tailored resume JSON with this exact shape:
{
  "matchScore": <number 0-100>,
  "tailoredResume": {
    "personalInfo": { "fullName": "", "email": "", "phone": "", "linkedin": "", "github": "", "portfolio": "", "location": "" },
    "summary": "",
    "experience": [{ "company": "", "role": "", "startDate": "", "endDate": "", "current": false, "bullets": [""] }],
    "education": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": "" }],
    "skills": [{ "category": "", "items": [""] }],
    "projects": [{ "name": "", "description": "", "technologies": [""], "link": "" }],
    "certifications": [{ "name": "", "issuer": "", "date": "" }]
  },
  "improvements": ["<string>"],
  "matchedKeywords": ["<string>"],
  "missingKeywords": ["<string>"]
}`;

    const raw = await callClaude(SYSTEM_PROMPT, userMessage, { maxTokens: 8192 });
    const parsed = JSON.parse(extractJSON(raw)) as TailorResponse;

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[resume/tailor]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
