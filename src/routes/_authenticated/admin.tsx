import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Plus, Trash2, LogOut, Upload, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminData, addProperty, updateProperty, removeProperty, uploadPropertyFile } from "@/lib/catalogue.functions";
import { propertySchema } from "@/lib/forms";
import { CATEGORIES, LISTING_TYPES } from "@/lib/site";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import logoNavy from "@/assets/logo-navy.png";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type EnquiryRow = Database["public"]["Tables"]["enquiries"]["Row"];

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel | Oceans & Earth Realty" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const selectCls = "flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(file);
  });
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchAdmin = useServerFn(getAdminData);
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-data"], queryFn: () => fetchAdmin() });
  const [tab, setTab] = useState<"properties" | "enquiries">("properties");
  const [editing, setEditing] = useState<PropertyRow | "new" | null>(null);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  if (error || !data) return <div className="flex min-h-screen items-center justify-center text-destructive">Could not load the admin panel. Please try again.</div>;
  if (!data.authorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-xl">This account does not have administrator access.</p>
        <p className="text-sm text-muted-foreground">Sign in with the authorised administrator email.</p>
        <Button variant="outline" onClick={signOut}>Sign out</Button>
      </div>
    );
  }

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-data"] });
    queryClient.invalidateQueries({ queryKey: ["catalogue"] });
  };

  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-4">
            <img src={logoNavy} alt="Oceans and Earth" className="h-8 w-auto" />
            <span className="eyebrow text-muted-foreground">Admin panel</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">View site</Link>
            <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /> Sign out</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button onClick={() => setTab("properties")} className={`rounded-sm border px-4 py-2 text-sm ${tab === "properties" ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>Properties ({data.properties.length})</button>
            <button onClick={() => setTab("enquiries")} className={`rounded-sm border px-4 py-2 text-sm ${tab === "enquiries" ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>Enquiries ({data.enquiries.length})</button>
          </div>
          {tab === "properties" && (
            <Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> Add property</Button>
          )}
        </div>

        {tab === "properties" ? (
          <PropertiesTable properties={data.properties} onEdit={(p) => setEditing(p)} onChanged={refresh} />
        ) : (
          <EnquiriesTable enquiries={data.enquiries} />
        )}
      </main>

      {editing !== null && (
        <PropertyFormDialog
          property={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function PropertiesTable({ properties, onEdit, onChanged }: { properties: PropertyRow[]; onEdit: (p: PropertyRow) => void; onChanged: () => void }) {
  const remove = useServerFn(removeProperty);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function doRemove(id: string) {
    setBusy(true);
    setErr("");
    try {
      await remove({ data: { id } });
      setConfirmId(null);
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Unable to remove property");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-md border bg-card">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">Property</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Location</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Featured</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((p) => (
            <tr key={p.id} className="border-b last:border-0">
              <td className="px-4 py-3">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.slug}</p>
              </td>
              <td className="px-4 py-3">{p.category}</td>
              <td className="px-4 py-3">{p.type}</td>
              <td className="px-4 py-3">{p.location}</td>
              <td className="px-4 py-3">{p.price}</td>
              <td className="px-4 py-3">{p.featured && <Star className="h-4 w-4 fill-primary text-primary" />}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(p)}><Pencil className="h-4 w-4" /> Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmId(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </td>
            </tr>
          ))}
          {properties.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No properties yet. Add your first one.</td></tr>
          )}
        </tbody>
      </table>

      <Dialog open={confirmId !== null} onOpenChange={(o) => !o && setConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remove this property?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">It will disappear from the website immediately. This cannot be undone.</p>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmId(null)}>Keep it</Button>
            <Button variant="destructive" disabled={busy} onClick={() => confirmId && doRemove(confirmId)}>{busy ? "Removing…" : "Remove"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EnquiriesTable({ enquiries }: { enquiries: EnquiryRow[] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-md border bg-card">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">When</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Interested in</th>
            <th className="px-4 py-3 font-medium">Budget</th>
            <th className="px-4 py-3 font-medium">City</th>
            <th className="px-4 py-3 font-medium">Source</th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map((e) => (
            <tr key={e.id} className="border-b last:border-0">
              <td className="px-4 py-3 whitespace-nowrap">{new Date(e.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
              <td className="px-4 py-3 font-medium">{e.name}</td>
              <td className="px-4 py-3"><a className="text-primary" href={`tel:${e.phone}`}>{e.phone}</a></td>
              <td className="px-4 py-3"><a className="text-primary" href={`mailto:${e.email}`}>{e.email}</a></td>
              <td className="px-4 py-3">{e.category}</td>
              <td className="px-4 py-3">{e.budget}</td>
              <td className="px-4 py-3">{e.city || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{e.context}</td>
            </tr>
          ))}
          {enquiries.length === 0 && (
            <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No enquiries yet. New form submissions will appear here.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

type FormState = {
  title: string; slug: string; category: string; type: string; property_type: string;
  location: string; price: string; area: string; beds: string; image: string;
  config: string; status: string; summary: string; highlights: string; featured: boolean; brochure_url: string;
};

function toForm(p: PropertyRow | null): FormState {
  return {
    title: p?.title ?? "", slug: p?.slug ?? "", category: p?.category ?? "Residential", type: p?.type ?? "New Projects",
    property_type: p?.property_type ?? "", location: p?.location ?? "", price: p?.price ?? "", area: p?.area ?? "",
    beds: p?.beds != null ? String(p.beds) : "", image: p?.image ?? "", config: p?.config ?? "", status: p?.status ?? "",
    summary: p?.summary ?? "", highlights: (p?.highlights ?? []).join(", "), featured: p?.featured ?? false, brochure_url: p?.brochure_url ?? "",
  };
}

function PropertyFormDialog({ property, onClose, onSaved }: { property: PropertyRow | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<FormState>(() => toForm(property));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const add = useServerFn(addProperty);
  const update = useServerFn(updateProperty);
  const upload = useServerFn(uploadPropertyFile);

  const set = (k: keyof FormState, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));
  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>;

  async function handleFile(kind: "photo" | "brochure", file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setErrors({});
    try {
      const base64 = await fileToBase64(file);
      const res = await upload({ data: { kind, fileName: file.name, contentType: file.type, base64 } });
      set(kind === "photo" ? "image" : "brochure_url", res.ref);
    } catch (e) {
      setErrors({ form: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setBusy(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const payload = {
      title: f.title, slug: f.slug, category: f.category, type: f.type, property_type: f.property_type,
      location: f.location, price: f.price, area: f.area,
      beds: f.beds.trim() === "" ? null : Number(f.beds),
      image: f.image, config: f.config, status: f.status, summary: f.summary,
      highlights: f.highlights.split(",").map((h) => h.trim()).filter(Boolean),
      featured: f.featured, brochure_url: f.brochure_url,
    };
    const parsed = propertySchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      if (property) await update({ data: { id: property.id, property: parsed.data } });
      else await add({ data: parsed.data });
      onSaved();
    } catch (e2) {
      setErrors({ form: e2 instanceof Error ? e2.message : "Unable to save" });
      setBusy(false);
    }
  }

  const fileLabel = (v: string) => v.startsWith("media:") ? "Uploaded file saved" : v ? "Link saved" : "";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal">{property ? `Edit ${property.title}` : "Add a property"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div>
            <Label htmlFor="pf-title">Title</Label>
            <Input id="pf-title" value={f.title} onChange={(e) => set("title", e.target.value)} className="mt-1" />
            {err("title")}
          </div>
          <div>
            <Label htmlFor="pf-slug">Web address (slug)</Label>
            <Input id="pf-slug" value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="e.g. palm-grove-villas" className="mt-1" />
            {err("slug")}
          </div>
          <div>
            <Label htmlFor="pf-cat">Category</Label>
            <select id="pf-cat" value={f.category} onChange={(e) => set("category", e.target.value)} className={`mt-1 ${selectCls}`}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="pf-type">Listing type</Label>
            <select id="pf-type" value={f.type} onChange={(e) => set("type", e.target.value)} className={`mt-1 ${selectCls}`}>
              {LISTING_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="pf-ptype">Property type</Label>
            <Input id="pf-ptype" value={f.property_type} onChange={(e) => set("property_type", e.target.value)} placeholder="e.g. Apartment, Villa, Office" className="mt-1" />
            {err("property_type")}
          </div>
          <div>
            <Label htmlFor="pf-loc">Location</Label>
            <Input id="pf-loc" value={f.location} onChange={(e) => set("location", e.target.value)} className="mt-1" />
            {err("location")}
          </div>
          <div>
            <Label htmlFor="pf-price">Price</Label>
            <Input id="pf-price" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. ₹1.85 Cr onwards" className="mt-1" />
            {err("price")}
          </div>
          <div>
            <Label htmlFor="pf-area">Area</Label>
            <Input id="pf-area" value={f.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. 1,950 sq ft" className="mt-1" />
            {err("area")}
          </div>
          <div>
            <Label htmlFor="pf-beds">Bedrooms (leave blank if none)</Label>
            <Input id="pf-beds" type="number" min={0} max={30} value={f.beds} onChange={(e) => set("beds", e.target.value)} className="mt-1" />
            {err("beds")}
          </div>
          <div>
            <Label htmlFor="pf-status">Status</Label>
            <Input id="pf-status" value={f.status} onChange={(e) => set("status", e.target.value)} placeholder="e.g. Under construction" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="pf-config">Configuration</Label>
            <Input id="pf-config" value={f.config} onChange={(e) => set("config", e.target.value)} placeholder="e.g. 3 & 4 BHK Apartments" className="mt-1" />
          </div>
          <div className="flex items-end gap-2 pb-1">
            <input id="pf-featured" type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4" />
            <Label htmlFor="pf-featured">Show in featured projects on the homepage</Label>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pf-summary">Summary</Label>
            <Textarea id="pf-summary" value={f.summary} onChange={(e) => set("summary", e.target.value)} rows={3} className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pf-highlights">Highlights (separate with commas)</Label>
            <Input id="pf-highlights" value={f.highlights} onChange={(e) => set("highlights", e.target.value)} placeholder="Clubhouse & pool, RERA registered" className="mt-1" />
            {err("highlights")}
          </div>
          <div>
            <Label>Photo</Label>
            <div className="mt-1 flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm hover:border-primary">
                <Upload className="h-4 w-4" /> Upload photo
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFile("photo", e.target.files?.[0])} />
              </label>
              {f.image && <span className="text-xs text-primary">{fileLabel(f.image) || "Photo set"}</span>}
            </div>
            {f.image && !f.image.startsWith("media:") && (
              <Input value={f.image} onChange={(e) => set("image", e.target.value)} placeholder="or paste an image link" className="mt-2" />
            )}
            {err("image")}
          </div>
          <div>
            <Label>Brochure (PDF, optional)</Label>
            <div className="mt-1 flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm hover:border-primary">
                <Upload className="h-4 w-4" /> Upload PDF
                <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFile("brochure", e.target.files?.[0])} />
              </label>
              {f.brochure_url && <span className="text-xs text-primary">{fileLabel(f.brochure_url) || "Brochure set"}</span>}
            </div>
            {err("brochure_url")}
          </div>
          <div className="sm:col-span-2" aria-live="polite">{err("form")}</div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : property ? "Save changes" : "Add property"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
