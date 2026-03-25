import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { callClaudeWithTool } from "@/lib/claude";
import type { InterviewFeedback, InterviewProblem, ChatMessage } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface EvaluateRequest {
  sessionId: string;
  code: string;
  interviewType: "coding" | "system-design" | "behavioral";
  problem: InterviewProblem;
  conversationHistory: Pick<ChatMessage, "role" | "content">[];
  userId: string;
}

// ── Shared feedback tool schema ──────────────────────────────────────────────

const FEEDBACK_TOOL = {
  name: "submit_evaluation",
  description: "Submit the structured interview evaluation result.",
  input_schema: {
    type: "object" as const,
    properties: {
      overallScore: { type: "integer", description: "Overall score 0-100" },
      categories: {
        type: "object",
        properties: {
          problemSolving: {
            type: "object",
            properties: {
              score: { type: "integer" },
              feedback: { type: "string" },
            },
            required: ["score", "feedback"],
          },
          codeQuality: {
            type: "object",
            properties: {
              score: { type: "integer" },
              feedback: { type: "string" },
            },
            required: ["score", "feedback"],
          },
          communication: {
            type: "object",
            properties: {
              score: { type: "integer" },
              feedback: { type: "string" },
            },
            required: ["score", "feedback"],
          },
          timeComplexity: {
            type: "object",
            properties: {
              score: { type: "integer" },
              feedback: { type: "string" },
            },
            required: ["score", "feedback"],
          },
          edgeCases: {
            type: "object",
            properties: {
              score: { type: "integer" },
              feedback: { type: "string" },
            },
            required: ["score", "feedback"],
          },
        },
        required: [
          "problemSolving",
          "codeQuality",
          "communication",
          "timeComplexity",
          "edgeCases",
        ],
      },
      strengths: { type: "array", items: { type: "string" } },
      improvements: { type: "array", items: { type: "string" } },
      mistakesLog: {
        type: "array",
        items: {
          type: "object",
          properties: {
            mistake: { type: "string" },
            correction: { type: "string" },
            severity: {
              type: "string",
              enum: ["minor", "major", "critical"],
            },
          },
          required: ["mistake", "correction", "severity"],
        },
      },
      summary: { type: "string" },
    },
    required: [
      "overallScore",
      "categories",
      "strengths",
      "improvements",
      "mistakesLog",
      "summary",
    ],
  },
};

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

Scoring guide: 90-100=exceptional, 75-89=strong, 60-74=adequate, 45-59=needs improvement, 0-44=significant gaps.
Reference specific code or conversation moments in your feedback. Provide a hiring recommendation in the summary (Strong Hire / Hire / Lean No-Hire / No-Hire) with justification.`;
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

For the categories: problemSolving=overall architecture quality, codeQuality=technical depth and API/data model design, communication=clarity of explanations, timeComplexity=scalability and performance thinking, edgeCases=fault tolerance and trade-off awareness.
Provide a hiring signal in the summary (Strong Hire / Hire / Lean No-Hire / No-Hire).`;
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

For the categories: problemSolving=STAR structure quality, codeQuality=specificity and credibility of examples, communication=clarity and structure, timeComplexity=impact and ownership demonstrated, edgeCases=reflection and growth mindset shown.
Provide a hiring signal in the summary.`;
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: EvaluateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { sessionId, code, interviewType, problem, conversationHistory, userId } =
    body;

  if (!sessionId || !userId || !problem) {
    return NextResponse.json(
      { error: "Missing required fields: sessionId, userId, problem" },
      { status: 400 }
    );
  }

  const conversation = formatConversation(conversationHistory ?? []);

  let systemPrompt: string;
  if (interviewType === "system-design") {
    systemPrompt = buildSystemDesignEvalPrompt(problem, code, conversation);
  } else if (interviewType === "behavioral") {
    systemPrompt = buildBehavioralEvalPrompt(problem, code, conversation);
  } else {
    systemPrompt = buildCodingEvalPrompt(problem, code, conversation);
  }

  let feedback: InterviewFeedback;
  try {
    feedback = await callClaudeWithTool<InterviewFeedback>(
      "You are a technical interview evaluator.",
      systemPrompt,
      FEEDBACK_TOOL,
      { maxTokens: 3000 }
    );
  } catch (err) {
    console.error("[evaluate] Claude error:", err);
    return NextResponse.json(
      { error: "Failed to generate evaluation. Please try again." },
      { status: 502 }
    );
  }

  // Persist to Firestore via Admin SDK (bypasses security rules)
  try {
    await adminDb.collection("interviews").doc(sessionId).update({
      status: "completed",
      feedback,
      completedAt: FieldValue.serverTimestamp(),
      code: code ?? "",
    });
  } catch (err) {
    // TODO: forward to Sentry or equivalent error tracking in production
    // so that silent failures here don't cause users to lose their interview history.
    console.error("[evaluate] Firestore update failed — user history not saved:", err);
  }

  // Increment interviewsUsed (fire and forget, admin SDK)
  adminDb
    .collection("users")
    .doc(userId)
    .update({ interviewsUsed: FieldValue.increment(1) })
    .catch((err) =>
      console.error("[evaluate] interviewsUsed increment failed:", err)
    );

  return NextResponse.json({ feedback });
}
