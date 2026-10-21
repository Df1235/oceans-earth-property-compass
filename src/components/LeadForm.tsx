import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, waLink } from "@/lib/site";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().regex(/^[+\d\s-]{10,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(120),
  category: z.enum(CATEGORIES),
  budget: z.string().min(1, "Select a budget"),
  city: z.string().trim().max(60).optional(),
});

const BUDGETS = ["Under ₹50 L", "₹50 L – 1 Cr", "₹1 – 3 Cr", "₹3 – 5 Cr", "Above ₹5 Cr"];
const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export function LeadForm({
  context,
  submitLabel = "Submit",
  defaultCategory,
  onDone,
}: {
  context: string;
  submitLabel?: string;
  defaultCategory?: (typeof CATEGORIES)[number];
  onDone?: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    const d = parsed.data;
    const msg = `New enquiry (${context})\nName: ${d.name}\nPhone: ${d.phone}\nEmail: ${d.email}\nInterested in: ${d.category}\nBudget: ${d.budget}${d.city ? `\nPreferred city: ${d.city}` : ""}`;
    window.open(waLink(msg), "_blank", "noopener");
    onDone?.();
  }

  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>;

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <Label htmlFor="lf-name">Full name</Label>
        <Input id="lf-name" name="name" className="mt-1" />
        {err("name")}
      </div>
      <div>
        <Label htmlFor="lf-phone">Phone</Label>
        <Input id="lf-phone" name="phone" type="tel" className="mt-1" />
        {err("phone")}
      </div>
      <div>
        <Label htmlFor="lf-email">Email</Label>
        <Input id="lf-email" name="email" type="email" className="mt-1" />
        {err("email")}
      </div>
      <div>
        <Label htmlFor="lf-cat">Interested in</Label>
        <select id="lf-cat" name="category" defaultValue={defaultCategory ?? "Residential"} className={`mt-1 ${selectCls}`}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="lf-budget">Budget</Label>
        <select id="lf-budget" name="budget" defaultValue="" className={`mt-1 ${selectCls}`}>
          <option value="" disabled>
            Select
          </option>
          {BUDGETS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        {err("budget")}
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="lf-city">Preferred city (optional)</Label>
        <Input id="lf-city" name="city" className="mt-1" />
      </div>
      <Button type="submit" size="lg" className="sm:col-span-2 mt-2 tracking-widest uppercase text-xs">
        {submitLabel}
      </Button>
    </form>
  );
}
