import { useState } from "react";
import { useServerFn } from '@tanstack/react-start';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/lib/site";
import { leadSchema as schema, BUDGETS } from '@/lib/forms';
import { submitEnquiry } from '@/lib/catalogue.functions';

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
  onDone?: () => void | Promise<void>;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy,setBusy]=useState(false);
  const [saved,setSaved]=useState(false);
  const save=useServerFn(submitEnquiry);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if(busy) return;
    const form=e.currentTarget;
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true); setSaved(false);
    try {
      await save({data:{...parsed.data,context}});
      setSaved(true); form.reset(); await onDone?.();
    } catch(error) { setErrors({form:error instanceof Error?error.message:'Please try again.'}); }
    finally {setBusy(false);}
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
      <div className="sm:col-span-2" aria-live="polite">{err('form')}{saved && <p className="text-sm text-primary">Thank you. Your enquiry has been received.</p>}</div>
      <Button disabled={busy} type="submit" size="lg" className="sm:col-span-2 mt-2 tracking-widest uppercase text-xs">
        {busy?'Submitting…':submitLabel}
      </Button>
    </form>
  );
}
