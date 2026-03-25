import { NextResponse } from "next/server";
import { callClaude, HAIKU } from "@/lib/claude";
import type { InterviewProblem } from "@/types";

export const maxDuration = 30;

interface BoilerplateRequest {
  language: string;
  problem: InterviewProblem;
  type: string;
}

function stripCodeFences(text: string): string {
  return text
    .replace(/^```[\w]*\n?/m, "")
    .replace(/\n?```\s*$/m, "")
    .trim();
}

export async function POST(request: Request) {
  let body: BoilerplateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { language, problem } = body;

  if (!language || !problem) {
    return NextResponse.json(
      { error: "Missing required fields: language, problem" },
      { status: 400 }
    );
  }

  let prompt: string;

  if (language === "sql") {
    prompt = `Generate SQL boilerplate for the following coding problem. The SQL will be executed in SQLite (via sql.js in the browser). Create:

1. CREATE TABLE statements that set up the necessary tables
2. INSERT statements with 5-10 rows of realistic sample data per table
3. A clear comment separator: -- ========== YOUR QUERY BELOW ==========
4. A placeholder SELECT query where the candidate will write their solution

IMPORTANT: Use SQLite-compatible syntax only. No MySQL/PostgreSQL-specific features.
- Use INTEGER, TEXT, REAL, BLOB types
- No ENUM, no AUTO_INCREMENT (use INTEGER PRIMARY KEY for autoincrement)
- No IF NOT EXISTS in CREATE TABLE (clean start)
- Date/time as TEXT in ISO format

Problem: ${problem.description}

Return ONLY the SQL code, no explanations outside of SQL comments.`;
  } else {
    const examplesText =
      problem.examples.length > 0
        ? problem.examples
            .map(
              (ex) =>
                `Input: ${ex.input}\nOutput: ${ex.output}${ex.explanation ? `\n# ${ex.explanation}` : ""}`
            )
            .join("\n\n")
        : "(no examples)";

    prompt = `Generate boilerplate starter code in ${language} for the following coding problem.
Include:
1. The function signature with proper types
2. Comments explaining the expected input/output
3. A main/test section with 2-3 test cases calling the function
4. Any necessary imports

Problem: ${problem.description}
Examples:
${examplesText}

Return ONLY the code, no explanations outside of code comments.`;
  }

  try {
    const raw = await callClaude(
      "You are a code boilerplate generator. Return only the code with no markdown fences, no extra explanations.",
      prompt,
      { maxTokens: 1500, model: HAIKU }
    );

    return NextResponse.json({ boilerplate: stripCodeFences(raw) });
  } catch (err) {
    console.error("[/api/interview/boilerplate] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate boilerplate" },
      { status: 500 }
    );
  }
}
