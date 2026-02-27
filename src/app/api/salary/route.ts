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
    const { role, experience, location, skills } = body;

    const prompt = `You are a compensation data expert. Provide salary insights for the following profile:
Role: ${role}
Years of Experience: ${experience}
Location: ${location}
Skills: ${skills.join(", ")}

Respond with a JSON object:
{
  "median": number,
  "low": number,
  "high": number,
  "currency": "USD",
  "marketTrend": "rising" | "stable" | "declining",
  "insights": string[]
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const salaryData = JSON.parse(content.text);
    return NextResponse.json(salaryData);
  } catch (error) {
    console.error("Salary route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
