/**
 * Central site content. Everything brand-, network- or pricing-related lives here
 * so it can be edited (or later sourced from a CMS/API) without touching components.
 *
 * NOTE: Network statistics below are configurable demo content, not contractual
 * guarantees. Replace with real figures once they are confirmed.
 */

export const brand = {
  name: "Offerhost",
  wordmark: "OFFERHOST",
  tagline: "GLOBAL INFRASTRUCTURE",
  network: "OFFERHOST GLOBAL NETWORK",
  networkTitle: "Offerhost Global Network",
  asn: "AS208220",
  rir: "RIPE NCC",
  description: "Global infrastructure for modern workloads.",
} as const;

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: "Dedicated Servers", href: "/servers/" },
  { label: "DDoS Protection", href: "/ddos/" },
  { label: "Network", href: "/network/" },
  { label: "Features", href: "/features/" },
  { label: "Support", href: "/support/" },
];

export const asnInfo = {
  status: "Active",
  rows: [
    { label: "RIR", value: brand.rir },
    { label: "ASN", value: brand.asn },
    { label: "Network", value: brand.networkTitle },
    { label: "IP Infrastructure", value: "Enterprise IPv4 & IPv6" },
    { label: "Routing", value: "BGP" },
    { label: "Locations", value: "Europe & Global" },
  ],
  // No public prefixes supplied yet — never invent ranges.
  ipRanges: "IP ranges available on request",
};

export type ServerPlan = {
  id: string;
  name: string;
  summary: string;
  specs: string[];
  /** Monthly price in EUR; `null` = not priced yet ("Price on request"). */
  price: number | null;
  featured?: boolean;
  badge?: string;
  /** Location id from `locations` below */
  location: string;
  /** Public manufacturer specs — safe to state. */
  cpu: { model: string; generation: string; cores: number; threads: number; clock: string };
  ram: string;
  storage: string;
  port: string;
  /** Range grouping on /servers/. */
  range: "ryzen" | "10g" | "storage";
};

export const serverPlans: ServerPlan[] = [
  {
    id: "ryzen-5-3600",
    name: "Ryzen 5 3600",
    summary: "Efficient 6-core for hosting and apps",
    specs: ["AMD Ryzen 5 3600", "128 GB DDR4", "2 × 1 TB NVMe", "1 Gbps IN / Unmetered OUT"],
    price: 90,
    location: "nl",
    cpu: { model: "AMD Ryzen 5 3600", generation: "Zen 2 (2019)", cores: 6, threads: 12, clock: "3.6 / 4.2 GHz" },
    ram: "128 GB DDR4",
    storage: "2 × 1 TB NVMe",
    port: "1 Gbps",
    range: "ryzen",
  },
  {
    id: "ryzen-7-3700x",
    name: "Ryzen 7 3700X",
    summary: "8 cores for business workloads",
    specs: ["AMD Ryzen 7 3700X", "128 GB DDR4", "2 × 1 TB NVMe", "1 Gbps IN / Unmetered OUT"],
    price: 100,
    location: "nl",
    cpu: { model: "AMD Ryzen 7 3700X", generation: "Zen 2 (2019)", cores: 8, threads: 16, clock: "3.6 / 4.4 GHz" },
    ram: "128 GB DDR4",
    storage: "2 × 1 TB NVMe",
    port: "1 Gbps",
    range: "ryzen",
  },
  {
    id: "ryzen-9-5950x",
    name: "Ryzen 9 5950X",
    summary: "16 cores for demanding applications",
    specs: ["AMD Ryzen 9 5950X", "128 GB DDR4", "2 × 1 TB NVMe", "1 Gbps IN / Unmetered OUT"],
    price: 150,
    featured: true,
    badge: "MOST POPULAR",
    location: "nl",
    cpu: { model: "AMD Ryzen 9 5950X", generation: "Zen 3 (2020)", cores: 16, threads: 32, clock: "3.4 / 4.9 GHz" },
    ram: "128 GB DDR4",
    storage: "2 × 1 TB NVMe",
    port: "1 Gbps",
    range: "ryzen",
  },
  {
    id: "ryzen-9-7950x",
    name: "Ryzen 9 7950X",
    summary: "Latest-gen Zen 4 with DDR5",
    specs: ["AMD Ryzen 9 7950X", "192 GB DDR5", "2 × 1 TB NVMe", "1 Gbps IN / Unmetered OUT"],
    price: 200,
    location: "nl",
    cpu: { model: "AMD Ryzen 9 7950X", generation: "Zen 4 (2022)", cores: 16, threads: 32, clock: "4.5 / 5.7 GHz" },
    ram: "192 GB DDR5",
    storage: "2 × 1 TB NVMe",
    port: "1 Gbps",
    range: "ryzen",
  },
  // Range additions — proposed configurations; price and stock live in facts.ts.
  {
    id: "ryzen-7-9700x",
    name: "Ryzen 7 9700X",
    summary: "Zen 5 mid-tier with DDR5",
    specs: ["AMD Ryzen 7 9700X", "64 GB DDR5", "2 × 1 TB NVMe", "1 Gbps port"],
    price: null,
    location: "nl",
    cpu: { model: "AMD Ryzen 7 9700X", generation: "Zen 5 (2024)", cores: 8, threads: 16, clock: "3.8 / 5.5 GHz" },
    ram: "64 GB DDR5",
    storage: "2 × 1 TB NVMe",
    port: "1 Gbps",
    range: "ryzen",
  },
  {
    id: "ryzen-9-7950x-10g",
    name: "Ryzen 9 7950X · 10G",
    summary: "16 cores on a 10 Gbps port",
    specs: ["AMD Ryzen 9 7950X", "192 GB DDR5", "2 × 2 TB NVMe", "10 Gbps port"],
    price: null,
    location: "nl",
    cpu: { model: "AMD Ryzen 9 7950X", generation: "Zen 4 (2022)", cores: 16, threads: 32, clock: "4.5 / 5.7 GHz" },
    ram: "192 GB DDR5",
    storage: "2 × 2 TB NVMe",
    port: "10 Gbps",
    range: "10g",
  },
  {
    id: "storage-4x16tb",
    name: "Storage 64 TB",
    summary: "Bulk storage for backups and media",
    specs: ["AMD Ryzen 7 3700X", "64 GB DDR4", "4 × 16 TB HDD + 2 × 1 TB NVMe", "1 Gbps port"],
    price: null,
    location: "nl",
    cpu: { model: "AMD Ryzen 7 3700X", generation: "Zen 2 (2019)", cores: 8, threads: 16, clock: "3.6 / 4.4 GHz" },
    ram: "64 GB DDR4",
    storage: "4 × 16 TB HDD + 2 × 1 TB NVMe",
    port: "1 Gbps",
    range: "storage",
  },
];

/** Plans shown on the homepage. */
export const featuredPlans = serverPlans.filter((p) => p.range === "ryzen" && p.price !== null);

export type Location = {
  id: string;
  name: string;
  flag: string;
  city: string;
  /** ISO-3166 alpha-3 codes used to render the dotted country silhouette */
  countries?: string[];
  pin?: { lat: number; lng: number };
};

export const locations: Location[] = [
  { id: "nl", name: "Netherlands", flag: "🇳🇱", city: "Amsterdam", countries: ["NLD"], pin: { lat: 52.37, lng: 4.9 } },
  { id: "de", name: "Germany", flag: "🇩🇪", city: "Frankfurt", countries: ["DEU"], pin: { lat: 50.11, lng: 8.68 } },
  { id: "gb", name: "United Kingdom", flag: "🇬🇧", city: "London", countries: ["GBR"], pin: { lat: 51.51, lng: -0.13 } },
  { id: "us", name: "United States", flag: "🇺🇸", city: "New York", countries: ["USA"], pin: { lat: 40.71, lng: -74.0 } },
  { id: "more", name: "More Locations", flag: "🌍", city: "On request" },
];

export type NetworkNode = { id: string; name: string; lat: number; lng: number; code: string };

export const networkNodes: NetworkNode[] = [
  { id: "ams", name: "Amsterdam", code: "AMS", lat: 52.37, lng: 4.9 },
  { id: "fra", name: "Frankfurt", code: "FRA", lat: 50.11, lng: 8.68 },
  { id: "lon", name: "London", code: "LON", lat: 51.51, lng: -0.13 },
  { id: "nyc", name: "New York", code: "NYC", lat: 40.71, lng: -74.0 },
];

/** Links drawn between nodes (by id). */
export const networkLinks: [string, string][] = [
  ["ams", "fra"],
  ["ams", "lon"],
  ["lon", "fra"],
  ["lon", "nyc"],
  ["ams", "nyc"],
];

/** Demo content — configurable, not a contractual SLA. */
export const networkStats = [
  { value: brand.asn, label: "Our ASN" },
  { value: "24/7", label: "Infrastructure Monitoring" },
  { value: "10 Gbps", label: "Available Network Ports" },
  { value: "99.9%+", label: "Target Network Availability" },
];

export const footerColumns: { title: string; links: NavItem[] }[] = [
  {
    title: "Products",
    links: [
      { label: "Dedicated Servers", href: "/servers/" },
      { label: "DDoS Protection", href: "/ddos/" },
      { label: "Features & Add-ons", href: "/features/" },
      { label: "Extra IPs", href: "/features/#ip-pricing" },
      { label: "Amsterdam", href: "/locations/amsterdam/" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Proxmox", href: "/use-cases/proxmox/" },
      { label: "Web Hosting", href: "/use-cases/web-hosting/" },
      { label: "Game Servers", href: "/use-cases/game-servers/" },
      { label: "Streaming", href: "/use-cases/streaming/" },
      { label: "Blockchain Nodes", href: "/use-cases/nodes/" },
    ],
  },
  {
    title: "Network & Proof",
    links: [
      { label: "Network & Looking Glass", href: "/network/" },
      { label: "System Status", href: "/status/" },
      { label: "Service Level Agreement", href: "/legal/sla/" },
      { label: `${brand.asn} on bgp.tools`, href: "https://bgp.tools/as/208220" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact & Support", href: "/support/" },
      { label: "FAQ", href: "/support/#faq" },
      { label: "Knowledge Base", href: "/kb/" },
      { label: "Report Abuse", href: "/legal/aup/#abuse" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/legal/terms/" },
      { label: "Privacy Policy", href: "/legal/privacy/" },
      { label: "Acceptable Use", href: "/legal/aup/" },
      { label: "Refunds & Cancellation", href: "/legal/refunds/" },
      { label: "Imprint", href: "/legal/imprint/" },
    ],
  },
];
