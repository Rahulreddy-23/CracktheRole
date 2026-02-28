import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/interview-prompts";
import { chatRequestSchema, formatZodErrors } from "@/lib/validations/api-schemas";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});


// --- Sliding window for token cost control ---
// Keep the first CONTEXT_HEAD messages (initial problem statement exchange)
// and the most recent CONTEXT_TAIL messages. This prevents the input context
// from growing unbounded during long interviews (e.g. 45-min sessions).
const CONTEXT_HEAD = 2;
const CONTEXT_TAIL = 18;
const MAX_CONTEXT_MESSAGES = CONTEXT_HEAD + CONTEXT_TAIL;

type Message = { role: "user" | "assistant"; content: string };

function applyContextWindow(messages: Message[]): Message[] {
  if (messages.length <= MAX_CONTEXT_MESSAGES) return messages;

  const head = messages.slice(0, CONTEXT_HEAD);
  const tail = messages.slice(-CONTEXT_TAIL);
  return [...head, ...tail];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate the request body with Zod
    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: formatZodErrors(parsed.error) }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { sessionId, messages } = parsed.data;

    // Fetch the session from the database to build the system prompt server-side
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("interview_type, difficulty, company_context")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Interview session not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build the system prompt entirely on the server
    const systemPrompt = buildSystemPrompt(
      session.interview_type,
      session.difficulty,
      session.company_context
    );

    // Apply sliding window to limit input tokens on long conversations.
    // The full conversation is still persisted to the DB below for scoring.
    const windowedMessages = applyContextWindow(messages);

    // Create a streaming response from Claude
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: windowedMessages,
    });

    // Build a ReadableStream that pipes Claude chunks to the client
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullContent = "";

        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullContent += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // After streaming completes, save the conversation to the database
          if (sessionId && sessionId !== "dev-mock-session") {
            try {
              // Build the full messages array to persist
              const allMessages = [
                ...messages,
                { role: "assistant", content: fullContent },
              ];

              await supabase
                .from("interview_sessions")
                .update({ messages: allMessages })
                .eq("id", sessionId);
            } catch (dbError) {
              console.error("Failed to save messages:", dbError);
            }
          }
        } catch (streamError) {
          console.error("Stream error:", streamError);
          controller.enqueue(
            encoder.encode(
              "\n\n[The interviewer is having a brief moment. Please try again.]"
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Interview chat error:", error);
    return new Response(
      JSON.stringify({
        error: "The interviewer is having a brief moment. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
