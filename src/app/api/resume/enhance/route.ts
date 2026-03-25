import { NextRequest, NextResponse } from "next/server";
import { callClaude, HAIKU } from "@/lib/claude";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM_PROMPTS: Record<string, string> = {
  summary: `You are an expert resume writer. Enhance the given professional summary to be concise, impactful, and ATS-friendly. Use active voice. Keep it 2-4 sentences. Return ONLY the enhanced text, no extra commentary.`,

  bullets: `You are an expert resume writer. Rewrite the given bullet points to start with strong action verbs, include quantifiable results where implied, and follow the STAR format. Return ONLY the rewritten bullets as a JSON array of strings: ["bullet1", "bullet2"]. No extra text.`,

  general: `You are an expert resume writer. Improve the given resume section content to be more professional, impactful, and ATS-friendly. Return ONLY the enhanced text.`,
};

interface EnhanceRequest {
  section: "summary" | "bullets" | "general";
  content: string;
  context?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EnhanceRequest;
    const { section, content, context } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[section] ?? SYSTEM_PROMPTS.general;

    const userMessage = context
      ? `Context (job/role): ${context}\n\nContent to enhance:\n${content}`
      : content;

    const enhanced = await callClaude(systemPrompt, userMessage, { maxTokens: 2048, model: HAIKU });

    if (section === "bullets") {
      try {
        const fenced = enhanced.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        const jsonStr = fenced ? fenced[1] : enhanced.trim();
        const bullets = JSON.parse(jsonStr) as string[];
        return NextResponse.json({ enhanced: bullets });
      } catch {
        // Fallback: split by newlines
        const bullets = enhanced
          .split(/\n+/)
          .map((l) => l.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean);
        return NextResponse.json({ enhanced: bullets });
      }
    }

    return NextResponse.json({ enhanced: enhanced.trim() });
  } catch (err) {
    console.error("[resume/enhance]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
