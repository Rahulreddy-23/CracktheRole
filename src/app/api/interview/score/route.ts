import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { scoreRequestSchema, formatZodErrors } from "@/lib/validations/api-schemas";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});


// Define the scorecard tool schema for structured output via Tool Use
const SCORECARD_TOOL: Anthropic.Messages.Tool = {
  name: "submit_scorecard",
  description:
    "Submit the final scorecard for an interview session. Call this tool with the scores and feedback after analyzing the transcript.",
  input_schema: {
    type: "object" as const,
    properties: {
      score_technical: {
        type: "number",
        description: "Technical skill score from 0 to 100",
      },
      score_communication: {
        type: "number",
        description: "Communication skill score from 0 to 100",
      },
      score_problem_solving: {
        type: "number",
        description: "Problem-solving ability score from 0 to 100",
      },
      score_time_management: {
        type: "number",
        description: "Time management score from 0 to 100",
      },
      overall_score: {
        type: "number",
        description: "Overall interview score from 0 to 100",
      },
      feedback_summary: {
        type: "string",
        description: "A 2-3 sentence summary of the candidate's performance",
      },
      strengths: {
        type: "array",
        items: { type: "string" },
        description: "List of 3 key strengths demonstrated",
      },
      improvements: {
        type: "array",
        items: { type: "string" },
        description: "List of 3 areas for improvement",
      },
    },
    required: [
      "score_technical",
      "score_communication",
      "score_problem_solving",
      "score_time_management",
      "overall_score",
      "feedback_summary",
      "strengths",
      "improvements",
    ],
  },
};

interface ScorecardInput {
  score_technical: number;
  score_communication: number;
  score_problem_solving: number;
  score_time_management: number;
  overall_score: number;
  feedback_summary: string;
  strengths: string[];
  improvements: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = scoreRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    const { sessionId } = parsed.data;

    // Fetch the session conversation from the database
    const { data: session, error: fetchError } = await supabase
      .from("interview_sessions")
      .select("messages, interview_type, difficulty, company_context")
      .eq("id", sessionId)
      .single();

    if (fetchError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const conversation = session.messages as Array<{
      role: string;
      content: string;
    }>;

    const transcript = conversation
      .map(
        (m) =>
          `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`
      )
      .join("\n\n");

    const scoringPrompt = `Analyze this ${session.interview_type} interview conversation (${session.difficulty} difficulty${session.company_context ? `, ${session.company_context} context` : ""}) and provide scores from 0-100 for each category. Be fair but realistic in scoring.

Interview Transcript:
${transcript}

Use the submit_scorecard tool to submit your evaluation.`;

    // Use Tool Use to get guaranteed structured JSON output
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools: [SCORECARD_TOOL],
      tool_choice: { type: "tool", name: "submit_scorecard" },
      messages: [{ role: "user", content: scoringPrompt }],
    });

    // Extract the tool use result — guaranteed to be structured JSON
    const toolUseBlock = response.content.find(
      (block) => block.type === "tool_use"
    );

    if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
      throw new Error("Claude did not return a tool_use response");
    }

    const scoreData = toolUseBlock.input as ScorecardInput;

    // Update the session with scores and mark as completed
    const { error: updateError } = await supabase
      .from("interview_sessions")
      .update({
        score_technical: scoreData.score_technical,
        score_communication: scoreData.score_communication,
        score_problem_solving: scoreData.score_problem_solving,
        score_time_management: scoreData.score_time_management,
        overall_score: scoreData.overall_score,
        feedback_summary: scoreData.feedback_summary,
        strengths: scoreData.strengths,
        improvements: scoreData.improvements,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Failed to update session:", updateError);
      throw updateError;
    }

    return NextResponse.json({
      sessionId,
      ...scoreData,
    });
  } catch (error) {
    console.error("Interview score error:", error);
    return NextResponse.json(
      { error: "Failed to generate score. Please try again." },
      { status: 500 }
    );
  }
}
