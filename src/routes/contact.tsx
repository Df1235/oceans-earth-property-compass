import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/SectionHead";
import { LeadForm } from "@/components/LeadForm";
import { SITE, waLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Oceans & Earth Realty, Karkardooma, Delhi" },
      { name: "description", content: "Call, WhatsApp or visit Oceans & Earth Realty at Community Centre, Karkardooma, East Delhi." },
      { property: "og:title", content: "Contact Oceans & Earth Realty" },
      { property: "og:description", content: "Speak to Saaurabh Nischal about buying, selling or investing." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's find your shore" text={`Speak directly with ${SITE.owner}.`} />
      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-20 md:grid-cols-2">
        <ul className="space-y-8">
          <li className="flex gap-4"><Phone className="mt-1 h-5 w-5 text-primary" /><div><p className="eyebrow text-muted-foreground">Call</p><a href={`tel:${SITE.phoneRaw}`} className="text-xl">{SITE.phone}</a></div></li>
          <li className="flex gap-4"><MessageCircle className="mt-1 h-5 w-5 text-primary" /><div><p className="eyebrow text-muted-foreground">WhatsApp</p><a href={waLink("Hi Oceans & Earth Realty!")} target="_blank" rel="noopener noreferrer" className="text-xl">{SITE.phone}</a></div></li>
          <li className="flex gap-4"><Mail className="mt-1 h-5 w-5 text-primary" /><div><p className="eyebrow text-muted-foreground">Email</p><a href={`mailto:${SITE.email}`} className="break-all text-xl">{SITE.email}</a></div></li>
          <li className="flex gap-4"><MapPin className="mt-1 h-5 w-5 text-primary" /><div><p className="eyebrow text-muted-foreground">Office</p><p className="text-xl">{SITE.address[0]}<br />{SITE.address[1]}</p></div></li>
        </ul>
        <div className="rounded-md border bg-card p-8 shadow-soft">
          <h2 className="text-3xl">Send an enquiry</h2>
          <div className="mt-6"><LeadForm context="Contact page" submitLabel="Send enquiry" /></div>
        </div>
      </section>
    </>
  );
}
