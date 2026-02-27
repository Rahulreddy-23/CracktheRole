import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

export async function POST(request: NextRequest) {
  try {
    // Auth check (skip in dev bypass mode)
    if (!DEV_BYPASS) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const body = await request.json();
    const { sessionId, messages, systemPrompt } = body;

    if (!messages || !systemPrompt) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a streaming response from Claude
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: systemPrompt,
      messages,
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
              const supabase = await createClient();
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
