"use client";

import { useLiveData } from "@/lib/live";
import type { ServerPlan } from "@/lib/site";
import { ServerCard } from "./ServerCard";

export function PlanGrid({ initial }: { initial: ServerPlan[] }) {
  const plans = useLiveData("plans", initial, (raw) => (Array.isArray(raw.items) && raw.items.length ? (raw.items as ServerPlan[]) : null));
  return (
    <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan, i) => (
        <ServerCard key={plan.id} plan={plan} index={i} />
      ))}
    </div>
  );
}
