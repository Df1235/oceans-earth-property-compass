import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Download, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeadForm } from "@/components/LeadForm";
import { waLink } from "@/lib/site";
import { catalogueOptions } from '@/lib/catalogue';
import { getBrochure } from '@/lib/catalogue.functions';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params,context }) => {
    const {projects:PROJECTS}=await context.queryClient.ensureQueryData(catalogueOptions);
    const project = PROJECTS.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.project.name} — ${loaderData.project.location} | Oceans & Earth Realty` },
          { name: "description", content: loaderData.project.summary },
          { property: "og:title", content: loaderData.project.name },
          { property: "og:description", content: loaderData.project.summary },
        ]
      : [{ title: "Project | Oceans & Earth Realty" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="py-40 text-center">
      <p>Project not found.</p>
      <Link to="/properties" className="text-primary underline">See all properties</Link>
    </div>
  ),
  component: ProjectPage,
});

function ProjectPage() {
  const { project: p } = Route.useLoaderData();
  const [open, setOpen] = useState(false);
  const brochure=useServerFn(getBrochure);

  async function download() {
    const result=await brochure({data:{slug:p.slug}});
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${p.slug}-brochure.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setOpen(false);
  }

  return (
    <>
      <section className="relative h-[75vh] min-h-[480px] overflow-hidden bg-ink">
        <img src={p.image} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="bg-hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 text-primary-foreground">
          <p className="eyebrow opacity-80">{p.category} · {p.type} · {p.status}</p>
          <h1 className="mt-3 text-5xl md:text-7xl">{p.name}</h1>
          <p className="mt-3 flex items-center gap-2 opacity-85"><MapPin className="h-4 w-4" />{p.location}</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="eyebrow text-primary">Overview</p>
          <p className="mt-4 text-2xl leading-relaxed">{p.summary}</p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {p.highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 border-b pb-4"><Check className="h-5 w-5 text-primary" />{h}</li>
            ))}
          </ul>
        </div>
        <aside className="h-fit rounded-md border bg-card p-8 shadow-soft">
          <p className="eyebrow text-muted-foreground">Starting price</p>
          <p className="mt-2 font-display text-4xl text-primary">{p.price}</p>
          <p className="mt-4 text-sm text-muted-foreground">{p.config}</p>
          <Button onClick={() => setOpen(true)} className="eyebrow mt-8 w-full" size="lg">
            <Download className="h-4 w-4" /> Download brochure
          </Button>
          <a href={waLink(`Hi, I'd like to know more about ${p.name}.`)} target="_blank" rel="noopener noreferrer" className="eyebrow mt-3 flex w-full items-center justify-center rounded-sm border border-primary px-6 py-4 text-primary">
            Enquire on WhatsApp
          </a>
        </aside>
      </section>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-normal">Get the {p.name} brochure</DialogTitle>
            <DialogDescription>Fill in a few details and your download starts right away.</DialogDescription>
          </DialogHeader>
          <LeadForm context={`Brochure: ${p.name}`} submitLabel="Download brochure" defaultCategory={p.category} onDone={download} />
        </DialogContent>
      </Dialog>
    </>
  );
}
