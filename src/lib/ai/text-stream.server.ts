import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessageStreamWriter,
} from "ai";

/**
 * Streams a fixed piece of text back to the AiChat widget using the same
 * UI-message stream protocol that `streamText().toUIMessageStreamResponse()`
 * produces. Lets us answer from the local FAQ table with zero LLM calls while
 * the client keeps using the standard `useChat` transport unchanged.
 */
export function respondWithText(text: string): Response {
  const stream = createUIMessageStream({
    execute: ({ writer }: { writer: UIMessageStreamWriter }) => {
      const id = crypto.randomUUID();
      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: text });
      writer.write({ type: "text-end", id });
    },
  });
  return createUIMessageStreamResponse({ stream });
}
