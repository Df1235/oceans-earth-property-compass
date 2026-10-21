export function SectionHead({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl md:text-5xl">{title}</h2>
      {text && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{text}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <section className="wave-pattern bg-ink pb-16 pt-36 text-ink-foreground">
      <div className="mx-auto max-w-7xl px-5">
        <p className="eyebrow opacity-70">{eyebrow}</p>
        <h1 className="mt-3 text-4xl md:text-6xl">{title}</h1>
        {text && <p className="mt-4 max-w-2xl text-lg opacity-80">{text}</p>}
      </div>
    </section>
  );
}
