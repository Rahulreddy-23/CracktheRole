import { NextRequest, NextResponse } from "next/server";
import { HAIKU } from "@/lib/claude";

export const runtime = "nodejs";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

async function extractWithClaude(
  base64: string,
  mediaType: "application/pdf"
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: HAIKU,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: "Extract all text from this document exactly as it appears. Preserve the structure — headings, bullet points, dates, and sections. Return only the extracted text with no commentary or formatting changes.",
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Claude API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    content: { type: string; text: string }[];
  };
  const textBlock = data.content.find((b) => b.type === "text");
  return textBlock?.text ?? "";
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    let text: string;

    if (name.endsWith(".pdf")) {
      const base64 = buffer.toString("base64");
      text = await extractWithClaude(base64, "application/pdf");
    } else if (name.endsWith(".docx")) {
      // Mammoth is a pure-JS DOCX parser with no worker dependency
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({
        arrayBuffer: buffer.buffer as ArrayBuffer,
      });
      text = result.value;
    } else if (name.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    return NextResponse.json({ text: text.trim().slice(0, 20000) });
  } catch (err) {
    console.error("[parse-file] error:", err);
    return NextResponse.json({ error: "Failed to parse file" }, { status: 500 });
  }
}
