import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SectionHead } from "@/components/SectionHead";
import { Calculators } from "@/components/Calculators";
import { KnowYourSpace } from "@/components/KnowYourSpace";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Stamp Duty, EMI, ROI & Area Calculators | Oceans & Earth Realty" },
      { name: "description", content: "Free property calculators: stamp duty, home loan EMI, ROI, area converter and a visual guide to carpet vs built-up area." },
      { property: "og:title", content: "Property Calculators | Oceans & Earth Realty" },
      { property: "og:description", content: "Stamp duty, EMI, ROI, area converter and Know Your Space." },
    ],
  }),
  component: Tools,
});

function Tools() {
  return (
    <>
      <PageHero eyebrow="Buyer tools" title="Calculators" text="Quick, honest estimates before you decide." />
      <section className="mx-auto max-w-7xl px-5 py-16"><Calculators /></section>
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead eyebrow="Know Your Space" title="Know Your Space" text="Understand what’s included in the area you’re buying." />
          <div className="mt-12"><KnowYourSpace /></div>
        </div>
      </section>
    </>
  );
}
