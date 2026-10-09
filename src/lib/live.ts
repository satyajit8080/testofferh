"use client";

import { useEffect, useState } from "react";

/**
 * Static pages ship with build-time content; this swaps in the latest data from
 * /api/site.php when it is available (it isn't in `next dev` or before the DB is set up).
 */
export function useLiveData<T>(resource: "plans" | "status", initial: T, map: (raw: Record<string, unknown>) => T | null): T {
  const [data, setData] = useState(initial);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/site.php?r=${resource}`, { headers: { Accept: "application/json" }, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((raw) => {
        if (cancelled || !raw?.ok) return;
        const mapped = map(raw);
        if (mapped) setData(mapped);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);
  return data;
}
