// Indicative stamp duty rates (%) by state and buyer. Registration fee is separate.
export const STAMP_RATES: Record<string, { male: number; female: number; joint: number; registration: number }> = {
  Delhi: { male: 6, female: 4, joint: 5, registration: 1 },
  "Uttar Pradesh": { male: 7, female: 6, joint: 6.5, registration: 1 },
  Haryana: { male: 7, female: 5, joint: 6, registration: 1 },
  Maharashtra: { male: 6, female: 5, joint: 6, registration: 1 },
  Karnataka: { male: 5, female: 5, joint: 5, registration: 1 },
  Goa: { male: 5, female: 5, joint: 5, registration: 1 },
};

export type Buyer = "male" | "female" | "joint";

export function stampDuty(value: number, state: string, buyer: Buyer) {
  const r = STAMP_RATES[state] ?? STAMP_RATES["Delhi"]!;
  const duty = (value * r[buyer]) / 100;
  const registration = (value * r.registration) / 100;
  return { rate: r[buyer], duty, registration, total: duty + registration };
}

export function emi(principal: number, annualRate: number, years: number) {
  const n = years * 12;
  const r = annualRate / 12 / 100;
  const monthly = r === 0 ? principal / n : (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  return { monthly, total: monthly * n, interest: monthly * n - principal };
}

export function roi(price: number, monthlyRent: number, appreciation: number, years: number, annualCosts: number) {
  const futureValue = price * (1 + appreciation / 100) ** years;
  const netRent = (monthlyRent * 12 - annualCosts) * years;
  const gain = futureValue - price + netRent;
  return {
    rentalYield: price ? ((monthlyRent * 12 - annualCosts) / price) * 100 : 0,
    futureValue,
    netRent,
    totalRoi: price ? (gain / price) * 100 : 0,
  };
}

// Conversion factor to square feet
export const AREA_UNITS: Record<string, number> = {
  "Square feet": 1,
  "Square metre": 10.7639,
  "Square yard (Gaj)": 9,
  Acre: 43560,
  Hectare: 107639,
  Marla: 272.25,
  Kanal: 5445,
};

export function convertArea(value: number, from: string, to: string) {
  return (value * (AREA_UNITS[from] ?? 1)) / (AREA_UNITS[to] ?? 1);
}

export function inr(n: number) {
  if (!isFinite(n)) return "—";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
