import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check (skip in dev bypass mode)
    if (!DEV_BYPASS) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

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

Provide a JSON response with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "score_technical": <number 0-100>,
  "score_communication": <number 0-100>,
  "score_problem_solving": <number 0-100>,
  "score_time_management": <number 0-100>,
  "overall_score": <number 0-100>,
  "feedback_summary": "<2-3 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"]
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [{ role: "user", content: scoringPrompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Parse the JSON from Claude's response (handle potential markdown fences)
    let jsonText = content.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const scoreData = JSON.parse(jsonText);

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
