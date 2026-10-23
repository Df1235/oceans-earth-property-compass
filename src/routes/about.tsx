import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/SectionHead";
import { SITE } from "@/lib/site";
import founder from "@/assets/founder.jpg.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Oceans & Earth Realty" },
      { name: "description", content: "Oceans & Earth Realty helps you discover possibilities, build your future and turn aspirations into addresses." },
      { property: "og:title", content: "About Oceans & Earth Realty" },
      { property: "og:description", content: "Personalised guidance, transparent communication and curated real estate." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="about-page">
      <PageHero eyebrow="About us" title="About Oceans & Earth Realty" />
      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-20 md:grid-cols-2">
        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p className="font-display text-2xl leading-snug text-foreground">
            At Oceans & Earth Realty, we believe real estate is more than buying property — it's about discovering opportunities, creating lasting value, and finding a place that truly belongs to you.
          </p>
          <p>With a passion for exceptional properties and a commitment to meaningful relationships, we bring together thoughtfully selected real estate opportunities that cater to diverse lifestyles, aspirations, and investment goals.</p>
          <p>From luxury residences and serene holiday homes to premium villas, residential plots, and promising investment destinations, our portfolio is curated with a focus on quality, location, and long-term potential.</p>
          <p>What sets us apart is our approach. We believe every client has a unique vision, and finding the right property begins with understanding that vision. Through personalized guidance, transparent communication, and market insights, we aim to make every real estate journey seamless, informed, and rewarding.</p>
          <p>At Oceans & Earth Realty, we don't just help you find properties. We help you discover possibilities, build your future, and turn aspirations into addresses.</p>
          <p className="font-display text-xl text-primary">Oceans & Earth Realty — Where Dreams Find Their Shore.</p>
        </div>
        <div>
          <img src={founder.url} alt={`${SITE.owner}, founder of Oceans & Earth Realty`} className="aspect-[2/3] w-full rounded-md object-cover" />
          <div className="-mt-16 ml-8 rounded-md bg-ink p-8 text-ink-foreground shadow-soft">
            <p className="eyebrow opacity-70">Founder</p>
            <p className="mt-2 font-display text-3xl">{SITE.owner}</p>
            <a href={`tel:${SITE.phoneRaw}`} className="mt-3 block opacity-85">{SITE.phone}</a>
          </div>
        </div>
      </section>
    </div>
  );
}
