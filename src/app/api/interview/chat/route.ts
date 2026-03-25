import { NextResponse } from "next/server";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  sessionId: string;
  message: string;
  code: string;
  conversationHistory: ConversationMessage[];
  problemContext: string;
  interviewType: string;
}

function buildSystemPrompt(
  problemContext: string,
  code: string,
  interviewType: string
): string {
  const codeSection =
    interviewType === "coding"
      ? `\n\nTheir current code:\n\`\`\`\n${code || "(no code yet)"}\n\`\`\``
      : code
      ? `\n\nTheir current answer:\n${code}`
      : "";

  return `You are a senior technical interviewer at a top tech company conducting a live ${interviewType} interview. The candidate is working on the following problem:

${problemContext}${codeSection}

Interview guidelines:
- Be encouraging but rigorous
- Ask clarifying questions about their approach
- If they're stuck, give subtle hints (don't give away the answer)
- Point out potential issues in their approach without giving solutions
- For system design: ask about trade-offs, scalability, and specific component choices
- For behavioral: probe for specific examples and measurable outcomes using the STAR method
- Keep responses concise (2-3 paragraphs max)
- If the candidate says they're done or wants to submit, acknowledge and let them know you'll evaluate their solution`;
}

export async function POST(request: Request) {
  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { sessionId, message, code, conversationHistory, problemContext, interviewType } = body;

  if (!message || !sessionId) {
    return NextResponse.json({ error: "Missing message or sessionId" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }

  const systemPrompt = buildSystemPrompt(problemContext, code ?? "", interviewType ?? "coding");

  // Build messages array — Claude requires alternating user/assistant
  // conversationHistory already includes the new user message at the end
  const messages = conversationHistory.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "(no body)");
      console.error("[chat] Claude API error:", res.status, body);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = (await res.json()) as {
      content: { type: string; text: string }[];
    };

    const textBlock = data.content.find((b) => b.type === "text");
    if (!textBlock) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 502 });
    }

    const reply = textBlock.text;

    // Persist messages to Firestore (fire-and-forget, don't block response)
    const userEntry = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: message,
      timestamp: new Date(),
    };
    const assistantEntry = {
      id: crypto.randomUUID(),
      role: "assistant" as const,
      content: reply,
      timestamp: new Date(),
    };

    updateDoc(doc(db, "interviews", sessionId), {
      messages: arrayUnion(userEntry, assistantEntry),
    }).catch((err) => console.error("[chat] Firestore update failed:", err));

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[chat] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
