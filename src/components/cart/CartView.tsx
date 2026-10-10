"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { F, Tbc } from "@/components/ui/Tbc";
import { clearCart, setQty, useCart } from "@/lib/cart";
import { contact, planDefaults } from "@/lib/facts";
import { findPlan, vatSuffix, type ResolvedPlan } from "@/lib/plans";

const eur = (n: number) => `€${n.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

function checkoutHref(plan: ResolvedPlan) {
  if (!planDefaults.checkoutUrlTemplate || !plan.billingProductId) return null;
  return planDefaults.checkoutUrlTemplate.replace("{pid}", encodeURIComponent(plan.billingProductId));
}

export function CartView() {
  const lines = useCart()
    .map((l) => ({ ...l, plan: findPlan(l.planId) }))
    .filter((l): l is typeof l & { plan: ResolvedPlan } => !!l.plan && l.plan.orderable);

  if (lines.length === 0) {
    return (
      <div className="rounded-[10px] border border-dashed border-line-strong p-10 text-center">
        <p className="text-fg">Your cart is empty.</p>
        <Link href="/servers/" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-400 hover:text-glow">
          Browse dedicated servers <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const monthly = lines.reduce((n, l) => n + (l.plan.price ?? 0) * l.qty, 0);
  const setupKnown = lines.every((l) => l.plan.setupFee !== null);
  const setup = lines.reduce((n, l) => n + (l.plan.setupFee ?? 0) * l.qty, 0);
  const vat = vatSuffix(planDefaults.pricesIncludeVat);
  const allLinked = lines.every((l) => checkoutHref(l.plan));

  const summary = lines.map((l) => `${l.qty} × ${l.plan.name} (${l.plan.id}) — ${eur(l.plan.price!)}/month`).join("\n");
  const mailto = contact.salesEmail
    ? `mailto:${contact.salesEmail}?subject=${encodeURIComponent("Server order")}&body=${encodeURIComponent(
        `Hello,\n\nI would like to order:\n\n${summary}\n\nCompany / name:\nBilling address:\nVAT ID (if business):\nPreferred OS:\n`,
      )}`
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <ul className="divide-y divide-line rounded-[10px] border border-line bg-ink-900/70">
        {lines.map(({ plan, qty }) => (
          <li key={plan.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-white">{plan.name}</p>
              <p className="mt-1 text-[13px] text-muted">
                {plan.cpu.cores}C/{plan.cpu.threads}T · {plan.ram} · {plan.storage} · {plan.port}
              </p>
              <p className="mt-1 text-[12px] text-subtle">
                Delivery: <F v={plan.delivery} />
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-md border border-line">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty(plan.id, qty - 1)} className="grid h-9 w-9 place-items-center text-fg/80 hover:text-white">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-mono text-sm tabular-nums" aria-live="polite">{qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty(plan.id, qty + 1)} className="grid h-9 w-9 place-items-center text-fg/80 hover:text-white">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="w-24 text-right font-mono text-sm tabular-nums text-white">{eur(plan.price! * qty)}</p>
              <button type="button" aria-label={`Remove ${plan.name}`} onClick={() => setQty(plan.id, 0)} className="text-subtle hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="glass ticks h-fit rounded-[10px] p-6">
        <h2 className="text-base font-semibold text-white">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Monthly</dt>
            <dd className="font-mono text-white">{eur(monthly)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">One-time setup</dt>
            <dd className="font-mono text-white">{setupKnown ? eur(setup) : <Tbc />}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">VAT</dt>
            <dd className="text-right text-white">{vat || <Tbc />}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Minimum term</dt>
            <dd className="text-right text-white">
              <F v={planDefaults.minimumTerm} />
            </dd>
          </div>
        </dl>

        <div className="mt-6 space-y-2">
          {allLinked ? (
            lines.map(({ plan }) => (
              <a key={plan.id} href={checkoutHref(plan)!} className="flex h-11 items-center justify-center gap-2 rounded-[6px] bg-brand-500 text-sm font-medium text-white hover:bg-brand-400">
                Checkout {lines.length > 1 ? plan.name : ""} <ArrowRight className="h-4 w-4" />
              </a>
            ))
          ) : mailto ? (
            <a href={mailto} className="flex h-11 items-center justify-center gap-2 rounded-[6px] bg-brand-500 text-sm font-medium text-white hover:bg-brand-400">
              Send order request <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <p className="rounded-md border border-dashed border-line-strong p-3 text-[13px] text-muted">
              Checkout: <Tbc label="billing link / sales email to confirm" />
            </p>
          )}
          <button type="button" onClick={clearCart} className="w-full py-2 text-[13px] text-subtle hover:text-fg">
            Empty cart
          </button>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-subtle">
          By ordering you agree to the <Link href="/legal/terms/" className="underline hover:text-fg">Terms</Link>,{" "}
          <Link href="/legal/aup/" className="underline hover:text-fg">Acceptable Use Policy</Link> and{" "}
          <Link href="/legal/refunds/" className="underline hover:text-fg">Refund Policy</Link>.
        </p>
      </aside>
    </div>
  );
}
