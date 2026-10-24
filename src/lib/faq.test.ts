import { describe, it, expect } from "vitest";
import { decideFaqReply, faqFallback, MIN_RANK } from "./faq";

describe("decideFaqReply", () => {
  it("returns the answer and matched:true for a match above the threshold", () => {
    const r = decideFaqReply({ answer: "We cover Delhi NCR.", rank: 0.5 });
    expect(r).toEqual({ answer: "We cover Delhi NCR.", matched: true });
  });
  it("returns the fallback and matched:false when there is no match", () => {
    const r = decideFaqReply(null);
    expect(r.matched).toBe(false);
    expect(r.answer).toBe(faqFallback());
  });
  it("falls back when the match rank is below MIN_RANK", () => {
    const r = decideFaqReply({ answer: "Weak match", rank: MIN_RANK / 2 });
    expect(r.matched).toBe(false);
    expect(r.answer).toBe(faqFallback());
  });
});
