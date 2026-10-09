/**
 * Status page types and the BUILD-TIME FALLBACK content.
 *
 * The live status is managed in the admin panel (/admin/status/) and loaded by
 * the page from /api/site.php. The data below is only shown if that API is
 * unavailable (e.g. `next dev`, or before the database is set up).
 *
 * Nothing here is measured automatically. `history` arrays are optional and
 * should only be filled from real monitoring data — days without data render as "No data".
 */

export type Status = "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";

export const statusMeta: Record<Status, { label: string; tone: string; dot: string }> = {
  operational: { label: "Operational", tone: "text-ok border-ok/30 bg-ok/10", dot: "bg-ok" },
  degraded: { label: "Degraded Performance", tone: "text-amber-300 border-amber-300/30 bg-amber-300/10", dot: "bg-amber-300" },
  partial_outage: { label: "Partial Outage", tone: "text-orange-400 border-orange-400/30 bg-orange-400/10", dot: "bg-orange-400" },
  major_outage: { label: "Major Outage", tone: "text-red-400 border-red-400/30 bg-red-400/10", dot: "bg-red-400" },
  maintenance: { label: "Under Maintenance", tone: "text-brand-300 border-brand-400/30 bg-brand-500/10", dot: "bg-brand-400" },
};

/** One entry per day, oldest first. `null` = no data recorded for that day. */
export type DayStatus = Status | null;

export type StatusComponent = {
  id: string;
  name: string;
  description?: string;
  status: Status;
  history?: DayStatus[];
};

export type ComponentGroup = { id: string; title: string; components: StatusComponent[] };

export const HISTORY_DAYS = 90;

export const componentGroups: ComponentGroup[] = [
  {
    id: "network",
    title: "Network — AS208220",
    components: [
      { id: "bgp", name: "BGP Routing", description: "Announcements and upstream sessions", status: "operational" },
      { id: "transit", name: "IP Transit & Peering", description: "Upstream connectivity", status: "operational" },
      { id: "ipv4", name: "IPv4 Connectivity", status: "operational" },
      { id: "ipv6", name: "IPv6 Connectivity", status: "operational" },
      { id: "ddos", name: "DDoS Protection", description: "Network-level mitigation", status: "operational" },
    ],
  },
  {
    id: "locations",
    title: "Data Center Locations",
    components: [
      { id: "ams", name: "Amsterdam, Netherlands", status: "operational" },
      { id: "fra", name: "Frankfurt, Germany", status: "operational" },
      { id: "lon", name: "London, United Kingdom", status: "operational" },
      { id: "nyc", name: "New York, United States", status: "operational" },
    ],
  },
  {
    id: "services",
    title: "Services",
    components: [
      { id: "dedicated", name: "Dedicated Servers", status: "operational" },
      { id: "portal", name: "Customer Portal", status: "operational" },
      { id: "support", name: "Support Desk", status: "operational" },
    ],
  },
];

/** Maps network-map nodes (see site.ts networkNodes) to status components. */
export const nodeComponent: Record<string, string> = { ams: "ams", fra: "fra", lon: "lon", nyc: "nyc" };

export type IncidentUpdate = { at: string; status: "investigating" | "identified" | "monitoring" | "resolved"; message: string };

export type Incident = {
  id: string;
  title: string;
  impact: Status;
  components: string[];
  /** ISO timestamps */
  startedAt: string;
  resolvedAt?: string | null;
  updates: IncidentUpdate[];
};

export type Maintenance = {
  id: string;
  title: string;
  components: string[];
  /** ISO timestamps */
  startsAt: string;
  endsAt: string;
  description: string;
};

// Add real incidents / maintenance windows here when they occur.
export const incidents: Incident[] = [];
export const maintenance: Maintenance[] = [];

const severity: Status[] = ["operational", "maintenance", "degraded", "partial_outage", "major_outage"];

export function overallStatus(groups: ComponentGroup[] = componentGroups): Status {
  const all = groups.flatMap((g) => g.components.map((c) => c.status));
  return all.reduce<Status>((worst, s) => (severity.indexOf(s) > severity.indexOf(worst) ? s : worst), "operational");
}

export function findComponent(id: string, groups: ComponentGroup[] = componentGroups) {
  return groups.flatMap((g) => g.components).find((c) => c.id === id);
}
