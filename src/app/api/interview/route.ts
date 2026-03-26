import { NextRequest, NextResponse } from "next/server";
import { callClaudeWithTool } from "@/lib/claude";
import { adminDb, verifyAuthToken } from "@/lib/firebase-admin";
import type { InterviewProblem } from "@/types";

// ── Tool schema ────────────────────────────────────────────────────────────

const PROBLEM_TOOL = {
  name: "submit_problem",
  description: "Submit the generated interview problem in structured format.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      examples: {
        type: "array",
        items: {
          type: "object",
          properties: {
            input: { type: "string" },
            output: { type: "string" },
            explanation: { type: "string" },
          },
          required: ["input", "output"],
        },
      },
      constraints: { type: "array", items: { type: "string" } },
      hints: { type: "array", items: { type: "string" } },
      difficulty: { type: "string" },
      topic: { type: "string" },
      boilerplate: {
        type: "object",
        description:
          "Map of language to starter code string, or null if not requested.",
      },
    },
    required: [
      "title",
      "description",
      "examples",
      "constraints",
      "hints",
      "difficulty",
      "topic",
    ],
  },
};

// ── Input sanitization ─────────────────────────────────────────────────────

/** Limit length and strip characters that have no place in a topic name. */
function sanitizeTopic(topic: string): string {
  return topic.trim().slice(0, 100).replace(/[<>"'`\\]/g, "");
}

// ── Prompt builders ────────────────────────────────────────────────────────

function buildCodingPrompt(
  difficulty: string,
  topic: string,
  language: string,
  needBoilerplate: boolean
): string {
  return `You are an expert technical interviewer at a top-tier tech company (Google, Meta, Amazon).
Generate a ${difficulty} coding interview problem about the topic: ${topic}

Requirements:
- The problem must be solvable in 30 minutes by a mid-level engineer
- Include exactly 2-3 examples, at least one edge case
- Include exactly 3-4 constraints (time/space complexity hints acceptable)
- Include exactly 2-3 hints that progressively reveal the solution approach
- Set the boilerplate key "${language}" to ${needBoilerplate ? `a complete function signature with parameter names and types as comments` : "null"}`;
}

function buildSystemDesignPrompt(difficulty: string, topic: string): string {
  return `You are a senior staff engineer conducting a system design interview.
Generate a ${difficulty} system design interview question for the topic: ${topic}

Requirements:
- Include 3-5 constraints (scale/performance requirements with specific numbers, e.g. 10M DAU, 99.99% uptime)
- Include 4-6 hints (design topics the candidate should cover)
- Leave examples and boilerplate as empty arrays/objects`;
}

function buildBehavioralPrompt(difficulty: string, topic: string): string {
  return `You are an experienced engineering manager conducting a behavioral interview.
Generate a behavioral interview question about the topic: ${topic}

Requirements:
- Title should be a single question starting with "Tell me about a time..." or "Describe a situation..."
- Description should include STAR method guidance and 2-3 likely follow-up questions
- Constraints should list 3 qualities of a strong answer
- Hints should be 3 probing follow-up questions
- Leave examples and boilerplate as empty arrays/objects`;
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Verify auth token
  let userId: string;
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
    userId = await verifyAuthToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    type: string;
    difficulty: string;
    topic: string;
    language: string;
    needBoilerplate: boolean;
    includeHints: boolean;
    userId: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Server-side interview limit check
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const data = userDoc.data();
    const interviewsUsed: number = data?.interviewsUsed ?? 0;
    const interviewsLimit: number = data?.interviewsLimit ?? 1;
    if (interviewsUsed >= interviewsLimit) {
      return NextResponse.json(
        { error: "Interview limit reached. Please upgrade to continue." },
        { status: 429 }
      );
    }
  } catch {
    // If Firestore check fails, don't block the user — log and continue
    console.error("[/api/interview] Failed to check interview limit");
  }

  const { type, difficulty, topic, language, needBoilerplate } = body;

  if (!type || !difficulty || !topic) {
    return NextResponse.json(
      { error: "Missing required fields: type, difficulty, topic" },
      { status: 400 }
    );
  }

  const safeTopic = sanitizeTopic(topic);

  let prompt: string;
  if (type === "coding") {
    prompt = buildCodingPrompt(
      difficulty,
      safeTopic,
      language ?? "python",
      needBoilerplate ?? false
    );
  } else if (type === "system-design") {
    prompt = buildSystemDesignPrompt(difficulty, safeTopic);
  } else {
    prompt = buildBehavioralPrompt(difficulty, safeTopic);
  }

  try {
    const parsed = await callClaudeWithTool<
      InterviewProblem & { boilerplate?: Record<string, string | null> }
    >("You are a technical interview question generator.", prompt, PROBLEM_TOOL, {
      maxTokens: 2048,
    });

    // Strip boilerplate from the returned problem and use it for initial editor content
    const { boilerplate: boilerplateMap, ...problem } = parsed;
    const boilerplate =
      type === "coding" && boilerplateMap ? (boilerplateMap[language] ?? "") : "";

    return NextResponse.json({ problem, boilerplate: boilerplate ?? "" });
  } catch (err) {
    console.error("[/api/interview] Error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate problem";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
