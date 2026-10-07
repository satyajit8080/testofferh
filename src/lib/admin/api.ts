/**
 * Browser client for the PHP API in public/api. Sends the session cookie (same-origin)
 * and the CSRF token on every state-changing request.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
    public body: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

let csrfToken = "";
export const setCsrf = (token: string) => {
  csrfToken = token;
};

type Options = { method?: "GET" | "POST"; body?: unknown; params?: Record<string, string | number | undefined> };

export async function api<T = Record<string, unknown>>(path: string, { method = "GET", body, params }: Options = {}): Promise<T> {
  const url = new URL(`/api/${path}`, window.location.origin);
  for (const [k, v] of Object.entries(params ?? {})) if (v !== undefined && v !== "") url.searchParams.set(k, String(v));

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(method === "POST" ? { "Content-Type": "application/json", "X-CSRF-Token": csrfToken } : {}),
      },
      body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  const data = (await res.json().catch(() => null)) as (Record<string, unknown> & { ok?: boolean; error?: string; fields?: Record<string, string> }) | null;
  // Session gone mid-use: let the admin shell send the user back to sign-in.
  if (res.status === 401 && path.startsWith("admin.php")) window.dispatchEvent(new Event("oh:unauthorized"));
  if (!res.ok || !data?.ok) {
    throw new ApiError(data?.error ?? `Request failed (${res.status}).`, res.status, data?.fields ?? {}, data ?? {});
  }
  return data as T;
}

// ---------------------------------------------------------------------------
// Shared types (mirror the PHP responses)
// ---------------------------------------------------------------------------

export type Role = "admin" | "editor";
export type User = { id: number; email: string; name: string; role: Role; totpEnabled: boolean };

export type MessageRow = {
  id: number;
  name: string;
  email: string;
  company: string;
  topic: string;
  plan: string;
  status: "new" | "handled";
  createdAt: string;
  preview: string;
};
export type MessageFull = MessageRow & {
  message: string;
  note: string;
  ip: string;
  userAgent: string;
  handledAt: string | null;
  handledBy: string | null;
};

export type Plan = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  cpu: string;
  ram: string;
  storage: string;
  network: string;
  price: number;
  location: string;
  featured: boolean;
  badge: string;
  orderUrl: string;
  visible: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type AuditRow = {
  id: number;
  user: string | null;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  ip: string;
  at: string;
};

export type StaffUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  totpEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type Invite = { link: string; emailed: boolean; expiresInHours: number };

/** Only allow redirects back into the admin area. */
export function safeNext(next: string | null): string {
  return next && /^\/admin\/[\w\-/?=&]*$/.test(next) && !next.startsWith("//") ? next : "/admin/";
}

export const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function fmtDate(iso: string | null | undefined) {
  return iso ? dateTime.format(new Date(iso)) : "—";
}

export function timeAgo(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}
