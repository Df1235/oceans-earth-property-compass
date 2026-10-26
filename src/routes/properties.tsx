import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SlidersHorizontal, X } from "lucide-react";
import { PageHero } from "@/components/SectionHead";
import { PropertyCard } from "@/components/PropertyCard";
import { CATEGORIES, LISTING_TYPES } from "@/lib/site";
import { useSuspenseQuery } from '@tanstack/react-query';
import { catalogueOptions } from '@/lib/catalogue';

const search = z.object({
  category: z.enum(CATEGORIES).optional(),
  type: z.enum(LISTING_TYPES).optional(),
});

export const Route = createFileRoute("/properties")({
  loader:({context})=>context.queryClient.ensureQueryData(catalogueOptions),
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Properties — Residential, Commercial & Plots | Oceans & Earth Realty" },
      { name: "description", content: "Browse new projects and resale homes, offices, shops and plots across Delhi NCR." },
      { property: "og:title", content: "Properties | Oceans & Earth Realty" },
      { property: "og:description", content: "New projects and resale: residential, commercial and plots & land." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Properties,
});

type S = z.infer<typeof search>;
function Pill({ active, children, search }: { active: boolean; children: React.ReactNode; search: S }) {
  return (
    <Link to="/properties" search={search} className={`rounded-sm border px-4 py-2 text-sm ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`}>
      {children}
    </Link>
  );
}

function Properties() {
  const { category, type } = Route.useSearch();
  const [open, setOpen] = useState(false);
  const {data:{listings:LISTINGS}}=useSuspenseQuery(catalogueOptions);
  const list = LISTINGS.filter((l) => (!category || l.category === category) && (!type || l.type === type));
  const activeCount = (category ? 1 : 0) + (type ? 1 : 0);
  return (
    <>
      <PageHero eyebrow="Properties" title={category ?? "All properties"} text="Thoughtfully selected for quality, location and long-term potential." />
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{list.length} {list.length === 1 ? "property" : "properties"}</p>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <Link to="/properties" search={{}} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" /> Clear
              </Link>
            )}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label="Filters"
              className={`flex items-center gap-2 rounded-sm border px-4 py-2 text-sm ${open ? "border-primary" : "bg-card hover:border-primary"}`}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeCount > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{activeCount}</span>}
            </button>
          </div>
        </div>
        {open && (
          <div className="mt-4 space-y-5 rounded-md border bg-card p-5">
            <div>
              <p className="eyebrow mb-3 text-muted-foreground">Category</p>
              <div className="flex flex-wrap gap-2">
                <Pill search={{ type }} active={!category}>All</Pill>
                {CATEGORIES.map((c) => <Pill key={c} search={{ category: c, type }} active={category === c}>{c}</Pill>)}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-3 text-muted-foreground">Listing type</p>
              <div className="flex flex-wrap gap-2">
                <Pill search={{ category }} active={!type}>Any</Pill>
                {LISTING_TYPES.map((t) => <Pill key={t} search={{ category, type: t }} active={type === t}>{t}</Pill>)}
              </div>
            </div>
          </div>
        )}
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((l) => <PropertyCard key={l.id} l={l} />)}
        </div>
        {list.length === 0 && <p className="py-20 text-center text-muted-foreground">No properties match these filters yet — message us and we'll find one for you.</p>}
      </section>
    </>
  );
}
