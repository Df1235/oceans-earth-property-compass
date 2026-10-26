import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, type ModelMessage, type UIMessage } from "ai";

/**
 * Streams a chat completion from Google Gemini via the Vercel AI SDK.
 *
 * Replaces the previous Lovable AI gateway provider. Uses the free-tier
 * friendly `gemini-3.5-flash-lite` model by default (highest free RPD);
 * override with the GEMINI_MODEL env var if needed.
 */
export function createGeminiCall(
  request: Request,
  config: { apiKey: string; model?: string },
  messages: ModelMessage[],
  system?: string,
) {
  const provider = createGoogleGenerativeAI({ apiKey: config.apiKey });
  const model = config.model || "gemini-3.5-flash-lite";

  const result = streamText({
    model: provider(model),
    ...(system ? { system } : {}),
    messages,
    maxRetries: 0,
    abortSignal: request.signal,
  });

  return {
    result,
    response: (_uiMessages?: UIMessage[]) => result.toUIMessageStreamResponse(),
  };
}
