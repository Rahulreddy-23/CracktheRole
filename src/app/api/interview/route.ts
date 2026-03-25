import { NextResponse } from "next/server";
import { callClaude, extractJSON } from "@/lib/claude";
import type { InterviewProblem } from "@/types";

// ── Prompt builders ────────────────────────────────────────────────────────

function buildCodingPrompt(
  difficulty: string,
  topic: string,
  language: string,
  needBoilerplate: boolean
): string {
  return `You are an expert technical interviewer at a top-tier tech company (Google, Meta, Amazon).
Generate a ${difficulty} coding interview problem about "${topic}".

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation outside the JSON):
{
  "title": "Concise problem title",
  "description": "Full problem statement in plain text. Explain what the function should do, include context. Be thorough.",
  "examples": [
    { "input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9." },
    { "input": "nums = [3,2,4], target = 6", "output": "[1,2]" }
  ],
  "constraints": [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9"
  ],
  "hints": [
    "Think about what data structure lets you look up values in O(1)",
    "Consider storing the complement of each element"
  ],
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "boilerplate": {
    "${language}": ${needBoilerplate ? `"// Write a complete function signature with parameter names and types as comments\\n// e.g. for Python: def function_name(param: type) -> return_type:\\n    pass"` : "null"}
  }
}

Requirements:
- The problem must be solvable in 30 minutes by a mid-level engineer
- Include exactly 2-3 examples, at least one edge case
- Include exactly 3-4 constraints (time/space complexity hints acceptable)
- Include exactly 2-3 hints that progressively reveal the solution approach
- Boilerplate must include the correct function signature for ${language} with parameter names${needBoilerplate ? "" : " (set to null since boilerplate is not requested)"}`;
}

function buildSystemDesignPrompt(difficulty: string, topic: string): string {
  return `You are a senior staff engineer conducting a system design interview.
Generate a ${difficulty} system design interview question for "${topic}".

Return ONLY a valid JSON object:
{
  "title": "Design [System Name]",
  "description": "Detailed problem statement covering: scenario context, what needs to be built, functional requirements (as a numbered list), non-functional requirements (scale, latency, availability targets). Be specific with numbers (e.g., 10M DAU, 1000 writes/sec).",
  "examples": [],
  "constraints": [
    "Handle 10 million daily active users",
    "99.99% uptime SLA",
    "Read latency < 100ms at p99"
  ],
  "hints": [
    "Start by clarifying requirements and estimating scale",
    "Consider a CDN for static content delivery",
    "Think about database sharding strategies for horizontal scaling"
  ],
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "boilerplate": {}
}

Include 3-5 constraints (scale/performance requirements) and 4-6 hints (design topics to cover).`;
}

function buildBehavioralPrompt(difficulty: string, topic: string): string {
  return `You are an experienced engineering manager conducting a behavioral interview.
Generate a behavioral interview question about "${topic}".

Return ONLY a valid JSON object:
{
  "title": "The main behavioral question (one sentence, starts with 'Tell me about a time...' or 'Describe a situation...')",
  "description": "Expanded context: what the interviewer is looking for, STAR method guidance (Situation, Task, Action, Result), and what a strong answer includes. Also list 2-3 likely follow-up questions.",
  "examples": [],
  "constraints": [
    "Strong ownership and accountability",
    "Measurable results with specific metrics",
    "Reflection on learnings"
  ],
  "hints": [
    "What was the specific conflict and your role?",
    "What actions did YOU personally take (not 'we')?",
    "What was the measurable outcome?"
  ],
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "boilerplate": {}
}`;
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: Request) {
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

  const { type, difficulty, topic, language, needBoilerplate } = body;

  if (!type || !difficulty || !topic) {
    return NextResponse.json(
      { error: "Missing required fields: type, difficulty, topic" },
      { status: 400 }
    );
  }

  // Build the appropriate prompt
  let prompt: string;
  if (type === "coding") {
    prompt = buildCodingPrompt(difficulty, topic, language ?? "python", needBoilerplate ?? false);
  } else if (type === "system-design") {
    prompt = buildSystemDesignPrompt(difficulty, topic);
  } else {
    prompt = buildBehavioralPrompt(difficulty, topic);
  }

  try {
    const raw = await callClaude(
      "You are a technical interview question generator. Return only valid JSON, no markdown formatting, no extra text.",
      prompt,
      { maxTokens: 2048 }
    );

    const jsonStr = extractJSON(raw);
    const parsed = JSON.parse(jsonStr) as InterviewProblem & {
      boilerplate?: Record<string, string | null>;
    };

    // Extract boilerplate for the initial editor content
    const boilerplate =
      type === "coding" && parsed.boilerplate
        ? (parsed.boilerplate[language] ?? "")
        : "";

    // Strip boilerplate from the problem (it's not part of InterviewProblem)
    const { boilerplate: _bp, ...problem } = parsed;
    void _bp;

    return NextResponse.json({ problem, boilerplate: boilerplate ?? "" });
  } catch (err) {
    console.error("[/api/interview] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate problem";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
