const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
export const SONNET = "claude-sonnet-4-6";
export const HAIKU = "claude-haiku-4-5-20251001";

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number; model?: string }
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: options?.model ?? SONNET,
      max_tokens: options?.maxTokens ?? 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    throw new Error(`Claude API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    content: { type: string; text: string }[];
  };

  const textBlock = data.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("Claude returned no text content");

  return textBlock.text;
}

/** Strip markdown code fences so we can JSON.parse the result */
export function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenced) return fenced[1].trim();
  // Try to find the outermost { ... } block
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}

interface ClaudeTool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * Calls Claude with Tool Use (function calling), forcing structured JSON output.
 * The model is required to call `tool.name` — its `input` is returned directly,
 * eliminating the need for regex JSON extraction and reducing parse failures.
 */
export async function callClaudeWithTool<T>(
  systemPrompt: string,
  userMessage: string,
  tool: ClaudeTool,
  options?: { maxTokens?: number; model?: string }
): Promise<T> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: options?.model ?? SONNET,
      max_tokens: options?.maxTokens ?? 4096,
      system: systemPrompt,
      tools: [tool],
      tool_choice: { type: "tool", name: tool.name },
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    throw new Error(`Claude API error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    content: { type: string; name?: string; input?: unknown }[];
  };

  const toolUseBlock = data.content.find((b) => b.type === "tool_use");
  if (!toolUseBlock?.input) {
    throw new Error(`Claude did not call the tool "${tool.name}"`);
  }

  return toolUseBlock.input as T;
}
