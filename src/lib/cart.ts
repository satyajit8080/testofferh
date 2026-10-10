"use client";

import { useSyncExternalStore } from "react";

/** Client-side cart kept in localStorage. The site is a static export, so checkout hands off to billing. */
export type CartLine = { planId: string; qty: number };

const KEY = "offerhost.cart.v1";
const listeners = new Set<() => void>();
const EMPTY: CartLine[] = [];
let cache: CartLine[] | null = null;

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.filter((l) => typeof l?.planId === "string" && l.qty > 0) : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(lines: CartLine[]) {
  cache = lines;
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Storage unavailable (private mode): the cart still works for this page view.
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function addToCart(planId: string) {
  const lines = read();
  const existing = lines.find((l) => l.planId === planId);
  write(existing ? lines.map((l) => (l.planId === planId ? { ...l, qty: l.qty + 1 } : l)) : [...lines, { planId, qty: 1 }]);
}

export function setQty(planId: string, qty: number) {
  write(qty <= 0 ? read().filter((l) => l.planId !== planId) : read().map((l) => (l.planId === planId ? { ...l, qty } : l)));
}

export function clearCart() {
  write([]);
}
