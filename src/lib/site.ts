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

/**
 * HostBill client area (customers: sign-in, sign-up, orders, invoices, servers).
 * TODO(offerhost): confirm these URLs match your HostBill install.
 */
export const clientArea = {
  home: "/clients/",
  login: "/clients/?cmd=login",
  register: "/clients/?cmd=signup",
};

export const mainNav: NavItem[] = [
  { label: "Dedicated Servers", href: "/#servers" },
  { label: "ASN & IP", href: "/#asn" },
  { label: "Network", href: "/#network" },
  { label: "Data Centers", href: "/#locations" },
  { label: "Company", href: "/#why" },
  { label: "Contact", href: "/contact/" },
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
  price: number;
  featured?: boolean;
  badge?: string;
  /** Location id from `locations` below */
  location: string;
  /** Order link (e.g. HostBill cart). Without one, "Configure" opens the contact form. */
  orderUrl?: string | null;
};

export const serverPlans: ServerPlan[] = [
  {
    id: "ryzen-5-3600",
    name: "Ryzen 5 3600",
    summary: "Efficient 6-core for hosting and apps",
    specs: ["AMD Ryzen 5 3600", "128 GB DDR4", "2 × 1 TB NVMe", "1 Gbps IN / Unmetered OUT"],
    price: 90,
    location: "nl",
  },
  {
    id: "ryzen-7-3700x",
    name: "Ryzen 7 3700X",
    summary: "8 cores for business workloads",
    specs: ["AMD Ryzen 7 3700X", "128 GB DDR4", "2 × 1 TB NVMe", "1 Gbps IN / Unmetered OUT"],
    price: 100,
    location: "nl",
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
  },
  {
    id: "ryzen-9-7950x",
    name: "Ryzen 9 7950X",
    summary: "Latest-gen Zen 4 with DDR5",
    specs: ["AMD Ryzen 9 7950X", "192 GB DDR5", "2 × 1 TB NVMe", "1 Gbps IN / Unmetered OUT"],
    price: 200,
    location: "nl",
  },
];

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
      { label: "Dedicated Servers", href: "/#servers" },
      { label: "ASN & IP", href: "/#asn" },
      { label: "Network", href: "/#network" },
      { label: "DDoS Protection", href: "/#network" },
    ],
  },
  {
    title: "Infrastructure",
    links: [
      { label: "Netherlands", href: "/#locations" },
      { label: "Germany", href: "/#locations" },
      { label: "United Kingdom", href: "/#locations" },
      { label: "United States", href: "/#locations" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Offerhost", href: "/#why" },
      { label: "Contact", href: "/contact/" },
      { label: "Network", href: "/#network" },
      { label: "Status", href: "/status/" },
    ],
  },
  {
    title: "Network",
    links: [
      { label: brand.asn, href: "/#asn" },
      { label: brand.rir, href: "/#asn" },
      { label: brand.networkTitle, href: "/#network" },
    ],
  },
];

/**
 * Contact details shown on /contact/.
 *
 * TODO(offerhost): fill in the real values. Every field is a placeholder until then.
 * Empty strings are HIDDEN on the page, so nothing fake is ever published.
 * The address the form actually emails is set separately in `public/api/contact.php`.
 */
export const contact = {
  /** Form handler, deployed from public/api/contact.php. */
  formEndpoint: "/api/contact.php",
  sales: {
    email: "", // TODO e.g. sales@…
    phone: "", // TODO optional, international format
  },
  support: {
    email: "", // TODO e.g. support@…
    /** Client area / ticket system URL, e.g. "/clients/" */
    portalUrl: "", // TODO
  },
  abuse: {
    email: "", // TODO abuse contact as registered for the ASN in the RIPE database
    nocEmail: "", // TODO optional NOC / peering contact
  },
  company: {
    legalName: "", // TODO optional
    address: "", // TODO optional
  },
};

export const contactTopics = [
  { value: "sales", label: "Sales / Dedicated Servers" },
  { value: "network", label: "ASN & IP / Network" },
  { value: "support", label: "Technical Support" },
  { value: "billing", label: "Billing" },
  { value: "abuse", label: "Abuse Report" },
  { value: "other", label: "Other" },
] as const;

export type ContactTopic = (typeof contactTopics)[number]["value"];

/** FAQ on /contact/. Generic on purpose — edit freely, but don't promise SLAs here. */
export const contactFaq = [
  {
    q: "How quickly can a server be deployed?",
    a: "It depends on the configuration and current stock. Standard plans are prepared from ready hardware; custom builds take longer. We confirm the expected delivery time with you before you order.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "The payment methods currently available are shown at checkout. If you need to pay in a different way, contact our billing team and we'll see what we can arrange.",
  },
  {
    q: "Can I get a custom configuration?",
    a: "Yes. Tell us the CPU, memory, storage, network and location you need and our team will put together a quote for a configuration that fits your workload.",
  },
  {
    q: "Do servers come with IP addresses?",
    a: `IPv4 and IPv6 addressing is available on our own network, ${brand.asn}. Let us know how many addresses you need; additional IPs are available on request and subject to RIPE NCC policy.`,
  },
];
