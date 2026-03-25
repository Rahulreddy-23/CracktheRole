import { NextResponse } from "next/server";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { callClaude, extractJSON } from "@/lib/claude";
import { updateUserStats } from "@/lib/db";
import type { InterviewFeedback, InterviewProblem, ChatMessage } from "@/types";

interface EvaluateRequest {
  sessionId: string;
  code: string;
  interviewType: "coding" | "system-design" | "behavioral";
  problem: InterviewProblem;
  conversationHistory: Pick<ChatMessage, "role" | "content">[];
  userId: string;
}

// ── Prompt builders ──────────────────────────────────────────────────────────

function formatConversation(
  history: Pick<ChatMessage, "role" | "content">[]
): string {
  if (!history.length) return "(No conversation recorded)";
  return history
    .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
    .join("\n\n");
}

function buildCodingEvalPrompt(
  problem: InterviewProblem,
  code: string,
  conversation: string
): string {
  return `You are a senior technical interviewer at a top tech company evaluating a candidate's coding interview performance. Be thorough, specific, and constructive.

**Problem:** ${problem.title}
**Difficulty:** ${problem.difficulty}
**Topic:** ${problem.topic}
**Description:** ${problem.description}

**Candidate's Final Code:**
\`\`\`
${code || "(No code submitted)"}
\`\`\`

**Interview Conversation:**
${conversation}

Evaluate the candidate's performance and return ONLY a valid JSON object with this exact structure (no markdown, no text outside JSON):
{
  "overallScore": <integer 0-100>,
  "categories": {
    "problemSolving": {
      "score": <integer 0-100>,
      "feedback": "Detailed feedback on problem-solving approach, algorithm choice, and overall solution strategy. Reference specific decisions."
    },
    "codeQuality": {
      "score": <integer 0-100>,
      "feedback": "Feedback on code structure, naming, readability, modularity, and best practices. Reference specific lines or patterns."
    },
    "communication": {
      "score": <integer 0-100>,
      "feedback": "How well they articulated their thought process, asked clarifying questions, and explained trade-offs during the interview."
    },
    "timeComplexity": {
      "score": <integer 0-100>,
      "feedback": "Analysis of time and space complexity of their solution. State the actual Big-O and whether they achieved the optimal complexity."
    },
    "edgeCases": {
      "score": <integer 0-100>,
      "feedback": "How thoroughly they considered and handled edge cases (empty input, null, overflow, duplicates, etc.)."
    }
  },
  "strengths": [
    "Specific strength 1 — reference actual code or conversation",
    "Specific strength 2",
    "Specific strength 3"
  ],
  "improvements": [
    "Specific improvement 1 with actionable advice",
    "Specific improvement 2",
    "Specific improvement 3"
  ],
  "mistakesLog": [
    {
      "mistake": "Concrete description of the mistake",
      "correction": "What they should have done instead",
      "severity": "minor"
    }
  ],
  "summary": "A 2-3 paragraph overall assessment written directly to the candidate (use 'you'). Cover what went well, key areas to work on, and a hiring recommendation (Strong Hire / Hire / Lean No-Hire / No-Hire) with justification."
}

Scoring guide: 90-100=exceptional, 75-89=strong, 60-74=adequate, 45-59=needs improvement, 0-44=significant gaps.`;
}

function buildSystemDesignEvalPrompt(
  problem: InterviewProblem,
  answer: string,
  conversation: string
): string {
  return `You are a staff engineer evaluating a system design interview. Be thorough and specific.

**Problem:** ${problem.title}
**Difficulty:** ${problem.difficulty}
**Description:** ${problem.description}

**Candidate's Written Answer:**
${answer || "(No written answer submitted)"}

**Interview Conversation:**
${conversation}

Evaluate and return ONLY a valid JSON object:
{
  "overallScore": <integer 0-100>,
  "categories": {
    "problemSolving": {
      "score": <integer 0-100>,
      "feedback": "Quality of the overall architecture: did they break down the problem correctly, identify core components, and propose a coherent design?"
    },
    "codeQuality": {
      "score": <integer 0-100>,
      "feedback": "Depth of technical detail: API design, data models, component interfaces, technology choices with justifications."
    },
    "communication": {
      "score": <integer 0-100>,
      "feedback": "How clearly they explained decisions, responded to follow-up questions, and structured their presentation."
    },
    "timeComplexity": {
      "score": <integer 0-100>,
      "feedback": "Scalability and performance considerations: did they address bottlenecks, estimate capacity, and propose horizontal/vertical scaling strategies?"
    },
    "edgeCases": {
      "score": <integer 0-100>,
      "feedback": "Failure modes, trade-offs acknowledged, CAP theorem awareness, data consistency, fault tolerance, and edge cases in the design."
    }
  },
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "improvements": ["Actionable improvement 1", "Actionable improvement 2", "Actionable improvement 3"],
  "mistakesLog": [
    { "mistake": "Design gap or incorrect assumption", "correction": "Better approach", "severity": "minor|major|critical" }
  ],
  "summary": "2-3 paragraphs written to the candidate covering architectural quality, key gaps, and a hiring signal (Strong Hire / Hire / Lean No-Hire / No-Hire)."
}`;
}

function buildBehavioralEvalPrompt(
  problem: InterviewProblem,
  answer: string,
  conversation: string
): string {
  return `You are an engineering manager evaluating a behavioral interview using the STAR method.

**Question:** ${problem.title}
**Context:** ${problem.description}

**Candidate's Written Response:**
${answer || "(No written answer submitted)"}

**Interview Conversation:**
${conversation}

Evaluate and return ONLY a valid JSON object:
{
  "overallScore": <integer 0-100>,
  "categories": {
    "problemSolving": {
      "score": <integer 0-100>,
      "feedback": "Use of STAR method: did they provide a clear Situation, Task, Action, and Result?"
    },
    "codeQuality": {
      "score": <integer 0-100>,
      "feedback": "Specificity and credibility: were the examples concrete, recent, and relevant? Did they sound authentic?"
    },
    "communication": {
      "score": <integer 0-100>,
      "feedback": "Clarity and structure of their answer. Did they stay on point? Did they over-explain or under-explain?"
    },
    "timeComplexity": {
      "score": <integer 0-100>,
      "feedback": "Impact and ownership: did they demonstrate measurable results and take clear personal ownership (not 'we')?"
    },
    "edgeCases": {
      "score": <integer 0-100>,
      "feedback": "Reflection and learning: did they show growth mindset, self-awareness, and lessons learned?"
    }
  },
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "improvements": ["Actionable improvement 1", "Actionable improvement 2", "Actionable improvement 3"],
  "mistakesLog": [
    { "mistake": "Weakness in the response", "correction": "How to improve it", "severity": "minor|major|critical" }
  ],
  "summary": "2-3 paragraphs written to the candidate. Cover what worked well in their storytelling, what needs sharpening, and a hiring signal."
}`;
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: EvaluateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { sessionId, code, interviewType, problem, conversationHistory, userId } = body;

  if (!sessionId || !userId || !problem) {
    return NextResponse.json(
      { error: "Missing required fields: sessionId, userId, problem" },
      { status: 400 }
    );
  }

  const conversation = formatConversation(conversationHistory ?? []);

  let prompt: string;
  if (interviewType === "system-design") {
    prompt = buildSystemDesignEvalPrompt(problem, code, conversation);
  } else if (interviewType === "behavioral") {
    prompt = buildBehavioralEvalPrompt(problem, code, conversation);
  } else {
    prompt = buildCodingEvalPrompt(problem, code, conversation);
  }

  let feedback: InterviewFeedback;
  try {
    const raw = await callClaude(
      "You are a technical interview evaluator. Return only valid JSON, no markdown, no extra text.",
      prompt,
      { maxTokens: 3000 }
    );
    const jsonStr = extractJSON(raw);
    feedback = JSON.parse(jsonStr) as InterviewFeedback;
  } catch (err) {
    console.error("[evaluate] Claude parse error:", err);
    return NextResponse.json(
      { error: "Failed to generate evaluation. Please try again." },
      { status: 502 }
    );
  }

  // Persist to Firestore
  try {
    await updateDoc(doc(db, "interviews", sessionId), {
      status: "completed",
      feedback,
      completedAt: serverTimestamp(),
      code: code ?? "",
    });
  } catch (err) {
    console.error("[evaluate] Firestore update error:", err);
    // Don't fail the request — return feedback even if save fails
  }

  // Increment interviewsUsed (fire and forget)
  updateUserStats(userId, "interviewsUsed").catch((err) =>
    console.error("[evaluate] updateUserStats failed:", err)
  );

  return NextResponse.json({ feedback });
}
