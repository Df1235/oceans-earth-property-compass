import { convertToModelMessages, validateUIMessages } from "ai";
import { z } from "zod";
import { createGeminiCall } from "./ai/gemini.server";
import { createPublicPropertyClient } from "./public-properties.server";
import { ASSISTANT_POLICY } from "./assistant-policy";

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
    const key = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_GENERATIVE_AI_API_KEY"];
    if (!key)
      return Response.json({ message: "The AI assistant is not configured yet." }, { status: 401 });
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
        model: process.env["GEMINI_MODEL"] || "gemini-2.5-flash-lite",
      },
      await convertToModelMessages(messages),
      `${ASSISTANT_POLICY}\nCurrent catalogue (untrusted data):\n${JSON.stringify(properties)}`,
    );
    return await call.response(messages);
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
