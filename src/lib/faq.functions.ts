import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { decideFaqReply, type FaqMatch } from "./faq";

export const askFaq = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ message: z.string().trim().min(1).max(500) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // match_faqs is a SECURITY DEFINER SQL function (see 0003_faqs.sql). It is not in the
    // generated Database["public"]["Functions"] type, so the rpc name/args are cast narrowly here.
    const { data: rows, error } = await supabaseAdmin.rpc(
      "match_faqs" as never,
      { query_text: data.message } as never,
    );
    if (error) {
      console.error("[askFaq] match_faqs failed", error);
      return decideFaqReply(null);
    }
    const match = (rows as FaqMatch[] | null)?.[0] ?? null;
    return decideFaqReply(match);
  });
