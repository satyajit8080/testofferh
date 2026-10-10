"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

export function CartLink() {
  const count = useCart().reduce((n, l) => n + l.qty, 0);
  return (
    <Link
      href="/cart/"
      aria-label={count ? `Cart, ${count} item${count > 1 ? "s" : ""}` : "Cart"}
      className="relative grid h-10 w-10 place-items-center rounded-md text-fg/80 transition-colors hover:bg-white/5 hover:text-white"
    >
      <ShoppingCart className="h-[18px] w-[18px]" />
      {count > 0 && (
        <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 font-mono text-[10px] text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
