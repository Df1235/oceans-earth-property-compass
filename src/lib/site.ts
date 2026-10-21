import heroResidential from "@/assets/hero-residential.jpg";
import heroCommercial from "@/assets/hero-commercial.jpg";
import heroVilla from "@/assets/hero-villa.jpg";
import plots from "@/assets/plots.jpg";
import interior from "@/assets/interior.jpg";
import villas from "@/assets/villas.jpg";
import retail from "@/assets/retail.jpg";

export const SITE = {
  name: "Oceans & Earth Realty",
  tagline: "Where Dreams Find Their Shore",
  owner: "Saaurabh Nischal",
  phone: "+91 99993 08625",
  phoneRaw: "919999308625",
  email: "saaurabh@oceansandearthrealty.com",
  address: ["Shop No-9/10, Plot No-6 L/S, Community Centre,", "Karkardooma, East Delhi, Delhi - 110092"],
};

export function waLink(text: string) {
  return `https://wa.me/${SITE.phoneRaw}?text=${encodeURIComponent(text)}`;
}

export const CATEGORIES = ["Residential", "Commercial", "Plots & Land"] as const;
export type Category = (typeof CATEGORIES)[number];
export const LISTING_TYPES = ["New Projects", "Resale"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const HERO_SLIDES = [
  { image: heroResidential, eyebrow: "Residential", title: "Homes that hold your story", text: "Luxury residences in prime locations across Delhi NCR." },
  { image: heroCommercial, eyebrow: "Commercial", title: "Addresses that build business", text: "Offices and retail spaces with long-term value." },
  { image: heroVilla, eyebrow: "Holiday Homes & Villas", title: "Where dreams find their shore", text: "Serene villas and getaways, thoughtfully curated." },
];

export type Project = {
  slug: string;
  name: string;
  category: Category;
  type: ListingType;
  location: string;
  price: string;
  config: string;
  status: string;
  image: string;
  summary: string;
  highlights: string[];
};

export const PROJECTS: Project[] = [
  {
    slug: "oceans-crest-residences",
    name: "Oceans Crest Residences",
    category: "Residential",
    type: "New Projects",
    location: "Sector 150, Noida",
    price: "₹1.85 Cr onwards",
    config: "3 & 4 BHK Apartments",
    status: "Under construction",
    image: heroResidential,
    summary: "Landscaped high-rise living with a central water garden, clubhouse and wide-span homes.",
    highlights: ["80% open green area", "Clubhouse & pool", "RERA registered", "Metro within 2 km"],
  },
  {
    slug: "earthline-business-park",
    name: "Earthline Business Park",
    category: "Commercial",
    type: "New Projects",
    location: "Golf Course Ext. Road, Gurugram",
    price: "₹65 L onwards",
    config: "Retail shops & office suites",
    status: "Launching soon",
    image: retail,
    summary: "High-street retail with office floors above, on a busy arterial road with strong footfall.",
    highlights: ["Assured rental options", "Double-height retail", "Ample parking", "Food court"],
  },
  {
    slug: "shoreline-plots",
    name: "Shoreline Plots",
    category: "Plots & Land",
    type: "New Projects",
    location: "Yamuna Expressway",
    price: "₹45 L onwards",
    config: "150 – 500 sq yd plots",
    status: "Ready to register",
    image: plots,
    summary: "Gated plotted township near the upcoming airport, with parks, wide roads and full security.",
    highlights: ["Near Jewar Airport", "Gated & secured", "40 ft internal roads", "Clear titles"],
  },
];

export type Listing = {
  id: string;
  title: string;
  category: Category;
  type: ListingType;
  propertyType: string;
  location: string;
  price: string;
  beds?: number;
  area: string;
  image: string;
  projectSlug?: string;
};

export const LISTINGS: Listing[] = [
  { id: "l1", title: "Oceans Crest Residences", category: "Residential", type: "New Projects", propertyType: "Apartment", location: "Sector 150, Noida", price: "₹1.85 Cr", beds: 3, area: "1,950 sq ft", image: heroResidential, projectSlug: "oceans-crest-residences" },
  { id: "l2", title: "Skyline Apartment", category: "Residential", type: "Resale", propertyType: "Apartment", location: "Preet Vihar, East Delhi", price: "₹2.40 Cr", beds: 4, area: "2,300 sq ft", image: interior },
  { id: "l3", title: "Palm Grove Villas", category: "Residential", type: "New Projects", propertyType: "Villa", location: "Sohna Road, Gurugram", price: "₹4.75 Cr", beds: 4, area: "3,800 sq ft", image: villas },
  { id: "l4", title: "Sea-facing Holiday Villa", category: "Residential", type: "Resale", propertyType: "Holiday Home", location: "North Goa", price: "₹6.20 Cr", beds: 5, area: "5,200 sq ft", image: heroVilla },
  { id: "l5", title: "Earthline Business Park", category: "Commercial", type: "New Projects", propertyType: "Retail Shop", location: "Golf Course Ext. Road, Gurugram", price: "₹65 L", area: "320 sq ft", image: retail, projectSlug: "earthline-business-park" },
  { id: "l6", title: "Grade-A Office Floor", category: "Commercial", type: "Resale", propertyType: "Office", location: "Karkardooma, East Delhi", price: "₹3.10 Cr", area: "4,000 sq ft", image: heroCommercial },
  { id: "l7", title: "Shoreline Plots", category: "Plots & Land", type: "New Projects", propertyType: "Residential Plot", location: "Yamuna Expressway", price: "₹45 L", area: "200 sq yd", image: plots, projectSlug: "shoreline-plots" },
  { id: "l8", title: "Farmhouse Land", category: "Plots & Land", type: "Resale", propertyType: "Farm Land", location: "Chattarpur, South Delhi", price: "₹8.50 Cr", area: "1 acre", image: villas },
];
