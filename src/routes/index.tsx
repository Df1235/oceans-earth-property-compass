import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeadForm } from "@/components/LeadForm";
import { KnowYourSpace } from "@/components/KnowYourSpace";
import { SectionHead } from "@/components/SectionHead";
import { HERO_SLIDES, SITE } from "@/lib/site";
import { useSuspenseQuery } from '@tanstack/react-query';
import { catalogueOptions } from '@/lib/catalogue';
import iconWhite from "@/assets/icon-white.png";
import interior from "@/assets/interior.jpg";
import heroCommercial from "@/assets/hero-commercial.jpg";
import plots from "@/assets/plots.jpg";

export const Route = createFileRoute("/")({
  loader:({context})=>context.queryClient.ensureQueryData(catalogueOptions),
  head: () => ({
    meta: [
      { title: "Oceans & Earth Realty — Homes, Commercial & Plots in Delhi NCR" },
      { name: "description", content: "Curated residences, villas, commercial spaces and plots with personal guidance. Where dreams find their shore." },
      { property: "og:title", content: "Oceans & Earth Realty" },
      { property: "og:description", content: "Curated residences, villas, commercial spaces and plots in Delhi NCR." },
    ],
  }),
  component: Index,
});

function HeroSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % HERO_SLIDES.length), 6500);
    return () => clearInterval(t);
  }, []);
  const s = HERO_SLIDES[i];
  if (!s) return null;
  return (
    <section className="relative h-[92vh] min-h-[560px] overflow-hidden bg-ink">
      {HERO_SLIDES.map((sl, k) => (
        <img
          key={sl.title}
          src={sl.image}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${k === i ? "animate-kenburns opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="bg-hero-overlay absolute inset-0" />
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-20 text-primary-foreground">
        <p key={s.eyebrow} className="eyebrow animate-in fade-in slide-in-from-bottom-2 duration-700">{s.eyebrow}</p>
        <h1 key={s.title} className="mt-4 max-w-3xl text-5xl leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 md:text-7xl">{s.title}</h1>
        <p className="mt-4 max-w-xl text-lg opacity-85">{s.text}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/properties" className="eyebrow rounded-sm bg-primary-foreground px-6 py-3 text-primary">Explore properties</Link>
          <div className="ml-auto flex items-center gap-3">
            <button aria-label="Previous" onClick={() => setI((i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="rounded-full border border-primary-foreground/50 p-2"><ChevronLeft className="h-5 w-5" /></button>
            <span className="eyebrow">{String(i + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}</span>
            <button aria-label="Next" onClick={() => setI((i + 1) % HERO_SLIDES.length)} className="rounded-full border border-primary-foreground/50 p-2"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function LeadPopup() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("oe-lead-seen")) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem("oe-lead-seen", "1");
    }, 5000);
    return () => clearTimeout(t);
  }, []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <p className="eyebrow text-primary">Find your shore</p>
          <DialogTitle className="font-display text-3xl font-normal">Tell us what you're looking for</DialogTitle>
          <DialogDescription>Share a few details our team will get back to you.</DialogDescription>
        </DialogHeader>
        <LeadForm context="Homepage pop-up" submitLabel="Request a callback" onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

const CATS = [
  { label: "Residential", image: interior, text: "Apartments, villas & holiday homes" },
  { label: "Commercial", image: heroCommercial, text: "Offices & retail spaces" },
  { label: "Plots & Land", image: plots, text: "Residential plots & farm land" },
] as const;

function Index() {
  const {data:{featured:PROJECTS}}=useSuspenseQuery(catalogueOptions);
  return (
    <>
      <HeroSlider />
      <LeadPopup />

      <section className="mx-auto max-w-7xl px-5 py-24">
        <SectionHead
          eyebrow="Oceans & Earth Realty"
          title="Discover possibilities. Build your future."
          text="From luxury residences and serene holiday homes to premium villas, residential plots and promising investment destinations — every property we offer is chosen for quality, location and long-term potential."
        />
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[["3", "Property categories"], ["NCR+", "Delhi, Noida, Gurugram & beyond"], ["1:1", "Personal guidance"], ["100%", "Transparent dealings"]].map(([n, l]) => (
            <div key={l} className="border-l pl-5">
              <p className="font-display text-5xl text-primary">{n}</p>
              <p className="mt-2 text-sm text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-3">
        {CATS.map((c) => (
          <Link key={c.label} to="/properties" search={{ category: c.label }} className="group relative h-[480px] overflow-hidden">
            <img src={c.image} alt={c.label} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="bg-hero-overlay absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-primary-foreground">
              <h3 className="text-4xl">{c.label}</h3>
              <p className="mt-2 text-sm opacity-80">{c.text}</p>
              <span className="eyebrow mt-6 inline-flex items-center gap-2">Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow="Current projects" title="Featured with us now" />
          <Link to="/properties" className="eyebrow border-b border-primary pb-1 text-primary">View all properties</Link>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {PROJECTS.map((p) => (
            <Link key={p.slug} to="/projects/$slug" params={{ slug: p.slug }} className="group block">
              <div className="aspect-[4/5] overflow-hidden rounded-md">
                <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <p className="eyebrow mt-5 text-[0.6rem] text-muted-foreground">{p.category} · {p.status}</p>
              <h3 className="mt-2 text-2xl">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.location} — <span className="font-semibold text-primary">{p.price}</span></p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-24">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead eyebrow="Know Your Space" title="Know Your Space" text="Understand what’s included in the area you’re buying." />
          <div className="mt-12"><KnowYourSpace /></div>
        </div>
      </section>

      <section className="wave-pattern bg-ink py-24 text-ink-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2">
          <div>
            <p className="eyebrow opacity-70">Buyer tools</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Plan with numbers, not guesses</h2>
            <p className="mt-4 max-w-md opacity-80">Stamp duty, home-loan EMI, investment ROI and an area converter — all free, all in one place.</p>
            <Link to="/tools" className="eyebrow mt-8 inline-block rounded-sm bg-primary-foreground px-6 py-3 text-primary">Open calculators</Link>
          </div>
          <img src={iconWhite} alt="" className="mx-auto w-56 opacity-90 md:w-72" />
        </div>
      </section>
    </>
  );
}
