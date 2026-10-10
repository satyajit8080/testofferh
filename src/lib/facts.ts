/**
 * Business facts that must be confirmed by Offerhost before they are published.
 *
 * Rule: every value here is either confirmed in writing (contract, registry
 * extract, upstream's written answer) or `null`. A `null` renders on the site
 * as a visible "To confirm" marker and is listed by `npm run facts`.
 * Never replace a `null` with an estimate.
 *
 * This file must stay free of `@/` imports so `scripts/check-facts.ts` can load it.
 */

/** Marker for a fact nobody has confirmed yet. */
export type Fact<T = string> = T | null;

export const company = {
  /** Registered legal name, exactly as on the trade register extract. */
  legalName: null as Fact,
  /** Trade name used on the site. */
  tradeName: "Offerhost",
  legalForm: null as Fact,
  /** Trade register and number, e.g. "KvK 12345678" or "Companies House 01234567". */
  registry: null as Fact,
  registrationNumber: null as Fact,
  vatId: null as Fact,
  address: {
    street: null as Fact,
    postcode: null as Fact,
    city: null as Fact,
    country: null as Fact,
  },
  /** Person(s) legally authorised to represent the company (imprint). */
  representative: null as Fact,
  /** Courts / law governing the Terms. */
  governingLaw: null as Fact,
};

export const contact = {
  salesEmail: null as Fact,
  supportEmail: null as Fact,
  abuseEmail: null as Fact,
  privacyEmail: null as Fact,
  /** E.164, e.g. "+31 20 000 0000". */
  phone: null as Fact,
  /** Human-readable hours incl. time zone, e.g. "Mon–Fri 09:00–18:00 CET". */
  phoneHours: null as Fact,
  /** URL of the live chat widget / page, if any. */
  liveChatUrl: null as Fact,
  liveChatHours: null as Fact,
  /** Ticket desk URL (client area). */
  ticketUrl: null as Fact,
  /** Client area / login URL. */
  clientAreaUrl: null as Fact,
};

/** Support response-time targets (first response), as promised in the SLA. */
export const supportTargets: { priority: string; description: string; firstResponse: Fact }[] = [
  { priority: "Critical", description: "Server or network down, no workaround", firstResponse: null },
  { priority: "High", description: "Service degraded or partly unavailable", firstResponse: null },
  { priority: "Normal", description: "Configuration help, questions", firstResponse: null },
  { priority: "Sales & billing", description: "Quotes, invoices, account changes", firstResponse: null },
];

/**
 * DDoS protection. Only fill a number when the upstream that filters
 * the traffic has confirmed it in writing — keep the source in `confirmedBy`.
 */
export const ddos = {
  /** Who filters: the upstream / scrubbing provider name(s). */
  filteringProvider: null as Fact,
  /** Where filtering happens, e.g. "upstream edge, before traffic reaches AS208220". */
  filteringPoint: null as Fact,
  /** Included in every plan at no extra cost? */
  includedInAllPlans: null as Fact<boolean>,
  /** Total mitigation capacity, e.g. "X Tbps". */
  capacity: null as Fact,
  /** Mitigation per customer IP before null-routing kicks in. */
  perIpLimit: null as Fact,
  /** Always-on or on-detection, and time to mitigate. */
  mode: null as Fact,
  timeToMitigate: null as Fact,
  /** Attack vectors covered (L3/L4). */
  vectors: null as Fact<string[]>,
  /** What triggers a null-route (blackhole) and for how long. */
  nullRouteTrigger: null as Fact,
  nullRouteDuration: null as Fact,
  /** Paid upgrade, if any. */
  upgrade: null as Fact,
  /** Document / email the numbers come from, with date. Not shown publicly. */
  confirmedBy: null as Fact,
};

/** Defaults that apply to every plan unless a plan overrides them. */
export const planDefaults = {
  currency: "EUR",
  /** true = list prices include VAT; false = excl. VAT. */
  pricesIncludeVat: null as Fact<boolean>,
  vatNote: null as Fact,
  setupFee: null as Fact<number>,
  /** e.g. "1 month". */
  minimumTerm: null as Fact,
  /** Committed bandwidth on the port, e.g. "1 Gbps guaranteed" or "shared". */
  guaranteedBandwidth: null as Fact,
  includedIpv4: null as Fact<number>,
  /** e.g. "/64". */
  includedIpv6: null as Fact,
  ecc: null as Fact<boolean>,
  ipmi: null as Fact<boolean>,
  /** Operating systems available via auto-install. */
  osList: null as Fact<string[]>,
  /** Ordering: when set, "Checkout" sends each cart line here. `{pid}` is replaced by the plan's billingProductId. */
  checkoutUrlTemplate: null as Fact,
};

export type Stock = "in_stock" | "low_stock" | "out_of_stock" | "coming_soon";

/** Per-plan stock, delivery and billing facts. Keyed by plan id in `site.ts`. */
export const planFacts: Record<
  string,
  {
    stock: Fact<Stock>;
    /** e.g. "Within 24 hours", "3–5 business days". */
    delivery: Fact;
    billingProductId?: Fact;
    price?: Fact<number>;
    /** Per-plan overrides of `planDefaults`. */
    setupFee?: Fact<number>;
    ecc?: Fact<boolean>;
    ipmi?: Fact<boolean>;
    guaranteedBandwidth?: Fact;
  }
> = {
  "ryzen-5-3600": { stock: null, delivery: null, billingProductId: null },
  "ryzen-7-3700x": { stock: null, delivery: null, billingProductId: null },
  "ryzen-9-5950x": { stock: null, delivery: null, billingProductId: null },
  "ryzen-9-7950x": { stock: null, delivery: null, billingProductId: null },
  // New range: proposed plans, not orderable until stock and price are confirmed.
  "ryzen-7-9700x": { stock: "coming_soon", delivery: null, billingProductId: null, price: null },
  "ryzen-9-7950x-10g": { stock: "coming_soon", delivery: null, billingProductId: null, price: null },
  "storage-4x16tb": { stock: "coming_soon", delivery: null, billingProductId: null, price: null },
};

/** Add-ons and extras. `available: null` = not confirmed; prices per month unless noted. */
export const extras: {
  id: string;
  name: string;
  description: string;
  available: Fact<boolean>;
  price: Fact;
}[] = [
  { id: "console", name: "Remote console (KVM/IPMI)", description: "Out-of-band screen and keyboard access from the panel, even when the OS does not boot.", available: null, price: null },
  { id: "rescue", name: "Rescue system", description: "Boot a live Linux environment over the network to repair file systems, reset passwords or copy data.", available: null, price: null },
  { id: "autoinstall", name: "OS auto-install", description: "Reinstall the operating system from the panel in a few clicks, with your SSH key pre-loaded.", available: null, price: null },
  { id: "failover", name: "Failover IP", description: "An IP that you can move between your servers in the same location from the panel or API.", available: null, price: null },
  { id: "vlan", name: "Private VLAN", description: "Layer-2 network between your servers that does not count towards public traffic.", available: null, price: null },
  { id: "backup", name: "Backup storage", description: "Off-server storage reachable over SFTP / rsync / Borg for backups and snapshots.", available: null, price: null },
  { id: "api", name: "API", description: "REST API for power control, reinstall, rDNS and IP management.", available: null, price: null },
  { id: "rdns", name: "Reverse DNS", description: "Set PTR records for your IPv4 and IPv6 addresses yourself.", available: null, price: null },
];

/** Extra IP price list. */
export const ipPricing: { item: string; setup: Fact; monthly: Fact; note?: string }[] = [
  { item: "Additional IPv4 (single)", setup: null, monthly: null },
  { item: "IPv4 /29 (8 addresses)", setup: null, monthly: null },
  { item: "IPv4 /28 (16 addresses)", setup: null, monthly: null },
  { item: "IPv6 /48", setup: null, monthly: null },
];

/** SLA. Every number here is a commercial commitment — confirm before publishing. */
export const sla = {
  networkUptime: null as Fact,
  hardwareReplacement: null as Fact,
  measurement: null as Fact,
  /** Credit as % of the affected service's monthly fee, by monthly availability. */
  credits: null as Fact<{ availability: string; credit: string }[]>,
  maxCredit: null as Fact,
  claimWindow: null as Fact,
};

export const refunds = {
  /** e.g. "14 days" — money-back window for first orders, or null if none. */
  moneyBackWindow: null as Fact,
  setupFeesRefundable: null as Fact<boolean>,
  cancellationNotice: null as Fact,
};

export const proof = {
  lookingGlass: "https://lg.offerhost.com",
  bgpTools: "https://bgp.tools/as/208220",
  ripestat: "https://stat.ripe.net/AS208220",
  heBgp: "https://bgp.he.net/AS208220",
  /** Only if a PeeringDB record exists. */
  peeringDb: null as Fact,
  /** Third-party review profiles — link only if the profile exists. */
  trustpilot: null as Fact,
  lowEndTalk: null as Fact,
  /** Email-subscribe URL for status updates (e.g. a mailing-list form). The RSS feed works without it. */
  statusSubscribeUrl: null as Fact,
  /** First day the status history covers (ISO date). */
  statusHistorySince: null as Fact,
};

/** Named customer quotes / case studies. Only publish with written permission. */
export const testimonials: {
  quote: string;
  name: string;
  role: string;
  company: string;
  url?: string;
  /** Where/when permission was given. Not shown publicly. */
  permission: string;
}[] = [];

/** Legal pages are drafts until reviewed; `true` shows a "Draft" banner on every legal page. */
export const legal = {
  draft: true,
  lastUpdated: null as Fact,
};

/** Amsterdam data centre details for /locations/amsterdam/. */
export const amsterdam = {
  facility: null as Fact,
  /** e.g. "ISO 27001, ISO 9001". */
  certifications: null as Fact,
  power: null as Fact,
  /** Test IP or file for speed tests, e.g. a looking-glass target. */
  testIp: null as Fact,
};
