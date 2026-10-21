import { describe, it, expect } from "vitest";
import { stampDuty, emi, convertArea } from "./calc";

describe("calculators", () => {
  it("Delhi stamp duty for a woman buyer is 4% plus 1% registration", () => {
    const r = stampDuty(10_000_000, "Delhi", "female");
    expect(r.duty).toBe(400_000);
    expect(r.registration).toBe(100_000);
  });
  it("Delhi stamp duty for a man is 6%", () => {
    expect(stampDuty(10_000_000, "Delhi", "male").duty).toBe(600_000);
  });
  it("EMI for 50L at 8.5% over 20 years is about 43,391", () => {
    expect(Math.round(emi(5_000_000, 8.5, 20).monthly)).toBe(43391);
  });
  it("1 square yard equals 9 square feet", () => {
    expect(convertArea(1, "Square yard (Gaj)", "Square feet")).toBe(9);
  });
});
