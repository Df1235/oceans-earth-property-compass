import { useState } from "react";

type Key = "carpet" | "builtup" | "super" | "balcony";

const TERMS: { key: Key; label: string; text: string }[] = [
  {
    key: "carpet",
    label: "Carpet area",
    text: "The net usable floor area inside the apartment. Under India’s RERA definition, it includes internal partition walls but excludes external walls, service shafts, exclusive balconies/verandahs, and exclusive open terraces.",
  },
  { key: "builtup", label: "Built-up area", text: "Generally, carpet area plus walls and attached balcony areas. The exact calculation can vary." },
  {
    key: "super",
    label: "Super built-up area",
    text: "Generally, built-up area plus an allocated share of common spaces, such as lobbies and corridors. Ask the developer what is included.",
  },
  { key: "balcony", label: "Balcony / terrace area", text: "Outdoor space attached exclusively to the apartment, shown separately from RERA carpet area." },
];

const LEGEND = [
  { cls: "bg-zone-carpet", label: "Rooms & internal partitions" },
  { cls: "bg-zone-wall", label: "External walls" },
  { cls: "bg-zone-balcony", label: "Balcony / terrace" },
  { cls: "bg-zone-common", label: "Shared spaces (lobby, corridor, lift)" },
];

export function KnowYourSpace() {
  const [active, setActive] = useState<Key>("carpet");
  const on = {
    rooms: active !== "balcony",
    walls: active === "builtup" || active === "super",
    balcony: active !== "carpet",
    common: active === "super",
  };
  const fill = (lit: boolean, v: string) => (lit ? `var(${v})` : "var(--muted)");
  const term = TERMS.find((t) => t.key === active)!;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
      <div>
        <div className="flex flex-wrap gap-2">
          {TERMS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`rounded-sm border px-4 py-2 text-sm transition-colors ${
                active === t.key ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-md border bg-card p-6">
          <h3 className="text-2xl text-primary">{term.label}</h3>
          <p className="mt-3 leading-relaxed text-muted-foreground">{term.text}</p>
        </div>
        <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
          {LEGEND.map((l) => (
            <li key={l.label} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-sm ${l.cls}`} />
              {l.label}
            </li>
          ))}
        </ul>
      </div>

      <svg viewBox="0 0 600 420" className="w-full rounded-md border bg-card" role="img" aria-label={`Floor plan highlighting ${term.label}`}>
        <g style={{ transition: "fill .4s" }}>
          {/* Common areas */}
          <rect x="10" y="10" width="110" height="400" fill={fill(on.common, "--zone-common")} className="transition-all duration-500" />
          <rect x="120" y="360" width="470" height="50" fill={fill(on.common, "--zone-common")} className="transition-all duration-500" />
          <text x="65" y="120" textAnchor="middle" fontSize="13" fill="var(--foreground)">Lift</text>
          <rect x="30" y="60" width="70" height="80" fill="none" stroke="var(--foreground)" strokeOpacity=".3" />
          <text x="65" y="230" textAnchor="middle" fontSize="13" fill="var(--foreground)">Lobby</text>
          <text x="355" y="391" textAnchor="middle" fontSize="13" fill="var(--foreground)">Common corridor</text>

          {/* External walls */}
          <rect x="140" y="20" width="340" height="330" fill={fill(on.walls, "--zone-wall")} className="transition-all duration-500" />
          {/* Rooms (inner area) */}
          <rect x="152" y="32" width="316" height="306" fill={fill(on.rooms, "--zone-carpet")} className="transition-all duration-500" />
          {/* Service shaft — always excluded */}
          <rect x="420" y="32" width="48" height="50" fill="var(--background)" stroke="var(--foreground)" strokeOpacity=".3" />
          <text x="444" y="62" textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">Shaft</text>
          {/* Internal partitions */}
          <g stroke="var(--foreground)" strokeOpacity={on.rooms ? 0.55 : 0.25} strokeWidth="4">
            <line x1="310" y1="32" x2="310" y2="200" />
            <line x1="152" y1="200" x2="420" y2="200" />
            <line x1="380" y1="200" x2="380" y2="338" />
          </g>
          <g fontSize="13" fill="var(--foreground)" textAnchor="middle">
            <text x="231" y="120">Bedroom</text>
            <text x="365" y="130">Bedroom 2</text>
            <text x="266" y="275">Living & Dining</text>
            <text x="424" y="275">Kitchen</text>
          </g>

          {/* Balcony */}
          <rect x="490" y="60" width="90" height="250" rx="2" fill={fill(on.balcony, "--zone-balcony")} className="transition-all duration-500" />
          <rect x="490" y="60" width="90" height="250" fill="none" stroke="var(--foreground)" strokeOpacity=".35" strokeDasharray="6 5" />
          <text x="535" y="190" textAnchor="middle" fontSize="13" fill="var(--foreground)">Balcony</text>
        </g>
      </svg>
    </div>
  );
}
