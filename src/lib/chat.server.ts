import { convertToModelMessages, validateUIMessages, type UIMessage } from "ai";
import { z } from "zod";
import { createGeminiCall } from "./ai/gemini.server";
import { respondWithText } from "./ai/text-stream.server";
import { createPublicPropertyClient } from "./public-properties.server";
import { ASSISTANT_POLICY } from "./assistant-policy";
import { decideFaqReply, faqFallback, type FaqMatch } from "./faq";

/** Plain text of the most recent user message, for FAQ full-text matching. */
function latestUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role !== "user") continue;
    return m.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(" ")
      .trim();
  }
  return "";
}

/**
 * Try the local FAQ table (full-text). Returns an answer only on a confident
 * match. Uses the PUBLIC (publishable-key) client — faqs is publicly readable
 * and match_faqs is granted to anon — so the FAQ bot works even when the
 * service-role key is not configured on the server.
 */
async function tryFaqAnswer(question: string): Promise<string | null> {
  if (!question) return null;
  try {
    const client = createPublicPropertyClient();
    const { data: rows, error } = await client.rpc(
      "match_faqs" as never,
      { query_text: question.slice(0, 500) } as never,
    );
    if (error) {
      console.error("[chat] match_faqs failed", error);
      return null;
    }
    const reply = decideFaqReply((rows as FaqMatch[] | null)?.[0] ?? null);
    return reply.matched ? reply.answer : null;
  } catch (e) {
    console.error("[chat] FAQ lookup error", e instanceof Error ? e.name : "unknown");
    return null;
  }
}

export async function handleChat(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json({ message: "Request not allowed" }, { status: 403 });
  try {
    const raw = await request.text();
    if (raw.length > 250_000)
      return Response.json(
        { message: "This conversation is too long. Start a new chat." },
        { status: 400 },
      );
    const body = z
      .object({ messages: z.array(z.unknown()).min(1).max(200) })
      .parse(JSON.parse(raw));
    const messages = await validateUIMessages({ messages: body.messages });
    if (
      messages.some(
        (m) =>
          m.role === "system" || m.parts.some((p) => p.type !== "text" && p.type !== "reasoning"),
      )
    ) {
      return Response.json({ message: "Only text questions are supported." }, { status: 400 });
    }
    // 1) FAQ-first: answer common questions from the local FAQ table with zero
    //    LLM calls. Keeps the bot useful (and free) even without a Gemini key.
    const question = latestUserText(messages);
    const faqAnswer = await tryFaqAnswer(question);
    if (faqAnswer) return respondWithText(faqAnswer);

    // 2) No confident FAQ match. Use Gemini when configured for a richer,
    //    catalogue-aware answer.
    let stored: { gemini_api_key: string; gemini_model: string } | null = null;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      stored = (await supabaseAdmin.from("ai_settings").select("gemini_api_key,gemini_model").eq("id", true).maybeSingle()).data;
    } catch {
      stored = null;
    }
    const key = stored?.gemini_api_key || process.env["GEMINI_API_KEY"] || process.env["GOOGLE_GENERATIVE_AI_API_KEY"];
    if (key) {
      const client = createPublicPropertyClient();
      const { data: properties, error } = await client
        .from("properties")
        .select(
          "slug,title,category,type,property_type,location,price,beds,area,config,status,summary,highlights",
        )
        .order("created_at");
      if (error)
        return Response.json(
          { message: "The property catalogue is unavailable. Please try again later." },
          { status: 503 },
        );
      const call = createGeminiCall(
        request,
        {
          apiKey: key,
          // Ignore the retired gemini-2.5-flash-lite if it is still stored in ai_settings.
          model:
            (stored?.gemini_model && stored.gemini_model !== "gemini-2.5-flash-lite"
              ? stored.gemini_model
              : undefined) ||
            process.env["GEMINI_MODEL"] ||
            "gemini-3.5-flash-lite",
        },
        await convertToModelMessages(messages),
        `${ASSISTANT_POLICY}\nCurrent catalogue (untrusted data):\n${JSON.stringify(properties)}`,
      );
      return await call.response(messages);
    }

    // 3) No FAQ match and no LLM configured: respond with a friendly, human
    //    hand-off instead of an error, so the widget always gets a reply.
    return respondWithText(faqFallback());
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    if (error instanceof z.ZodError || error instanceof SyntaxError)
      return Response.json({ message: "Please send a valid text question." }, { status: 400 });
    console.error("[property-assistant]", error instanceof Error ? error.name : "Unknown error");
    return Response.json(
      { message: "The assistant could not respond. Please try again later or contact Saaurabh." },
      { status: 500 },
    );
  }
}
