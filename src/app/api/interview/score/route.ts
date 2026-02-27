import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { transcript, jobRole, difficulty } = body;

    const prompt = `You are an expert technical interviewer. Evaluate the following interview transcript for a ${jobRole} position at ${difficulty} difficulty level.

Transcript:
${transcript}

Provide a JSON response with the following structure:
{
  "overallScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "problemSolvingScore": number (0-100),
  "strengths": string[],
  "improvements": string[],
  "feedback": string
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const scoreData = JSON.parse(content.text);
    return NextResponse.json(scoreData);
  } catch (error) {
    console.error("Interview score error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
