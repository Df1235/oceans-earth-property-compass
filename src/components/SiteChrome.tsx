import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import logoNavy from "@/assets/logo-navy.png";
import logoWhite from "@/assets/logo-white.png";
import { SITE, waLink } from "@/lib/site";

const NAV = [
  { to: "/properties", label: "Properties" },
  { to: "/tools", label: "Tools" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  const solid = !transparent || scrolled || open;
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors ${solid ? "bg-card/95 backdrop-blur border-b" : "bg-transparent"}`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link to="/" aria-label="Oceans & Earth Realty home">
          <img src={solid ? logoNavy : logoWhite} alt="Oceans and Earth" className="h-9 w-auto md:h-10" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`eyebrow transition-opacity hover:opacity-70 ${solid ? "text-foreground" : "text-primary-foreground"}`}
              activeProps={{ className: "underline underline-offset-8" }}
            >
              {n.label}
            </Link>
          ))}
          <a
            href={`tel:${SITE.phoneRaw}`}
            className={`eyebrow rounded-sm border px-4 py-2 ${solid ? "border-primary text-primary" : "border-primary-foreground/60 text-primary-foreground"}`}
          >
            Call Us
          </a>
        </nav>
        <button
          className={`md:hidden ${solid ? "text-foreground" : "text-primary-foreground"}`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-4 border-t bg-card px-5 py-6 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="eyebrow" onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <img src={logoWhite} alt="Oceans and Earth" className="h-10 w-auto" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed opacity-75">
            Thoughtfully selected residences, villas, plots and commercial spaces — with personal guidance from
            enquiry to keys.
          </p>
        </div>
        <div>
          <p className="eyebrow opacity-60">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/properties" search={{ category: "Residential" }}>Residential</Link></li>
            <li><Link to="/properties" search={{ category: "Commercial" }}>Commercial</Link></li>
            <li><Link to="/properties" search={{ category: "Plots & Land" }}>Plots & Land</Link></li>
            <li><Link to="/tools">Calculators & Know Your Space</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow opacity-60">Reach us</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" /> <a href={`tel:${SITE.phoneRaw}`}>{SITE.phone}</a></li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" /> <a href={`mailto:${SITE.email}`} className="min-w-0 break-words hover:underline">{SITE.email}</a></li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> <span>{SITE.address.join(" ")}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs opacity-60">
          © {new Date().getFullYear()} {SITE.name} — {SITE.tagline}. Calculator results are estimates only.
        </p>
      </div>
    </footer>
  );
}

export function WhatsAppFab() {
  return (
    <a
      href={waLink("Hi Oceans & Earth Realty, I'd like to know more about your properties.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-whatsapp p-4 text-primary-foreground shadow-soft transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden text-sm font-semibold group-hover:inline">Chat with us</span>
    </a>
  );
}
