import { SITE } from "./site";

// Minimum ts_rank score to accept a FAQ match. Below this (or no rows) we fall back.
export const MIN_RANK = 0.01;

export type FaqMatch = { answer: string; rank: number };
export type FaqReply = { answer: string; matched: boolean };

/** Friendly, text-only fallback that points the visitor to a human. */
export function faqFallback(): string {
  return `I'm not sure about that one yet. For a quick answer, reach ${SITE.owner} directly on WhatsApp or phone ${SITE.phone}, or email ${SITE.email}.`;
}

/**
 * Pure decision logic for the FAQ bot — no DB, server or supabase imports, so it
 * is safe to unit-test and to import from both client and server.
 */
export function decideFaqReply(match: FaqMatch | null): FaqReply {
  if (match && match.rank >= MIN_RANK) {
    return { answer: match.answer, matched: true };
  }
  return { answer: faqFallback(), matched: false };
}
