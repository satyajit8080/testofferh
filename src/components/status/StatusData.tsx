"use client";

import { createContext, useContext } from "react";
import { useLiveData } from "@/lib/live";
import { componentGroups, incidents, maintenance, type ComponentGroup, type Incident, type Maintenance } from "@/lib/status";

export type StatusData = {
  groups: ComponentGroup[];
  incidents: Incident[];
  maintenance: Maintenance[];
  /** ISO time the data was produced (build time for the fallback). */
  updatedAt: string;
};

const Ctx = createContext<StatusData | null>(null);

export function useStatusData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStatusData must be used inside StatusDataProvider");
  return v;
}

export function StatusDataProvider({ builtAt, children }: { builtAt: string; children: React.ReactNode }) {
  const data = useLiveData<StatusData>("status", { groups: componentGroups, incidents, maintenance, updatedAt: builtAt }, (raw) =>
    Array.isArray(raw.groups)
      ? {
          groups: raw.groups as ComponentGroup[],
          incidents: (raw.incidents as Incident[]) ?? [],
          maintenance: (raw.maintenance as Maintenance[]) ?? [],
          updatedAt: String(raw.updatedAt ?? builtAt),
        }
      : null,
  );
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}
