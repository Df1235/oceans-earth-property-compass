import { z } from "zod";
import { CATEGORIES, LISTING_TYPES } from "./site";

export const BUDGETS = ["Under ₹50 L", "₹50 L – 1 Cr", "₹1 – 3 Cr", "₹3 – 5 Cr", "Above ₹5 Cr"] as const;
export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().regex(/^[+\d\s-]{10,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(120),
  category: z.enum(CATEGORIES), budget: z.enum(BUDGETS),
  city: z.string().trim().max(60).optional(),
});
export const propertySchema = z.object({
  title: z.string().trim().min(2).max(120), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  category: z.enum(CATEGORIES), type: z.enum(LISTING_TYPES),
  property_type: z.string().trim().min(1).max(80), location: z.string().trim().min(2).max(160),
  price: z.string().trim().min(1).max(80), area: z.string().trim().min(1).max(80),
  beds: z.number().int().min(0).max(30).nullable(),
  image: z.string().min(1).max(2048).refine(v => v.startsWith('media:') || v.startsWith('/__l5e/assets-v1/') || /^https:\/\//.test(v), 'Select a photo'),
  config: z.string().max(160), status: z.string().max(80), summary: z.string().max(3000),
  highlights: z.array(z.string().trim().min(1).max(200)).max(20), featured: z.boolean(),
  brochure_url: z.string().max(2048).refine(v => !v || v.startsWith('media:') || /^https:\/\//.test(v), 'Select a PDF'),
});