import { Link } from "@tanstack/react-router";
import { BedDouble, MapPin, Ruler } from "lucide-react";
import type { Listing } from "@/lib/site";
import { waLink } from "@/lib/site";

export function PropertyCard({ l }: { l: Listing }) {
  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={l.image} alt={l.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="eyebrow absolute left-3 top-3 rounded-sm bg-card/90 px-2 py-1 text-[0.6rem] text-primary">{l.type}</span>
      </div>
      <div className="p-5">
        <p className="eyebrow text-[0.6rem] text-muted-foreground">{l.category} · {l.propertyType}</p>
        <h3 className="mt-2 text-xl">{l.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{l.location}</p>
        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
          <span className="font-semibold text-primary">{l.price}</span>
          <span className="flex items-center gap-3 text-muted-foreground">
            {l.beds && <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{l.beds} BHK</span>}
            <span className="flex items-center gap-1"><Ruler className="h-4 w-4" />{l.area}</span>
          </span>
        </div>
      </div>
    </>
  );
  const cls = "group block overflow-hidden rounded-md border bg-card transition-shadow hover:shadow-soft";
  return l.projectSlug ? (
    <Link to="/projects/$slug" params={{ slug: l.projectSlug }} className={cls}>{body}</Link>
  ) : (
    <a href={waLink(`Hi, I'm interested in ${l.title} (${l.location}, ${l.price}).`)} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
  );
}
