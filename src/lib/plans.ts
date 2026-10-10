import { planDefaults, planFacts, type Fact, type Stock } from "./facts";
import { serverPlans, type ServerPlan } from "./site";

export type ResolvedPlan = ServerPlan & {
  stock: Fact<Stock>;
  delivery: Fact;
  billingProductId: Fact;
  setupFee: Fact<number>;
  ecc: Fact<boolean>;
  ipmi: Fact<boolean>;
  guaranteedBandwidth: Fact;
  minimumTerm: Fact;
  includedIpv4: Fact<number>;
  includedIpv6: Fact;
  pricesIncludeVat: Fact<boolean>;
  /** Can be added to the cart: priced and not "coming soon". */
  orderable: boolean;
};

const pick = <T,>(override: Fact<T> | undefined, fallback: Fact<T>) => (override === undefined ? fallback : override);

export function resolvePlan(plan: ServerPlan): ResolvedPlan {
  const f = planFacts[plan.id] ?? { stock: null, delivery: null };
  const price = f.price === undefined ? plan.price : f.price;
  return {
    ...plan,
    price,
    stock: f.stock,
    delivery: f.delivery,
    billingProductId: f.billingProductId ?? null,
    setupFee: pick(f.setupFee, planDefaults.setupFee),
    ecc: pick(f.ecc, planDefaults.ecc),
    ipmi: pick(f.ipmi, planDefaults.ipmi),
    guaranteedBandwidth: pick(f.guaranteedBandwidth, planDefaults.guaranteedBandwidth),
    minimumTerm: planDefaults.minimumTerm,
    includedIpv4: planDefaults.includedIpv4,
    includedIpv6: planDefaults.includedIpv6,
    pricesIncludeVat: planDefaults.pricesIncludeVat,
    orderable: price !== null && f.stock !== "coming_soon" && f.stock !== "out_of_stock",
  };
}

export const resolvedPlans = serverPlans.map(resolvePlan);

export function findPlan(id: string) {
  return resolvedPlans.find((p) => p.id === id);
}

export const stockLabel: Record<Stock, { label: string; tone: string }> = {
  in_stock: { label: "In stock", tone: "text-ok border-ok/30 bg-ok/10" },
  low_stock: { label: "Low stock", tone: "text-amber-300 border-amber-300/30 bg-amber-300/10" },
  out_of_stock: { label: "Out of stock", tone: "text-red-400 border-red-400/30 bg-red-400/10" },
  coming_soon: { label: "Coming soon", tone: "text-brand-300 border-brand-400/30 bg-brand-500/10" },
};

export const vatSuffix = (inc: Fact<boolean>) => (inc === null ? "" : inc ? "incl. VAT" : "excl. VAT");
