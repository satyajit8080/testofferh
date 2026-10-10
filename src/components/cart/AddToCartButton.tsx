"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ShoppingCart } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { cn } from "@/lib/cn";

type Props = { planId: string; planName: string; orderable: boolean; featured?: boolean; className?: string };

/** "Configure" — adds the plan to the cart and opens it. Unorderable plans get a quote link instead. */
export function AddToCartButton({ planId, planName, orderable, featured, className }: Props) {
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const base = cn(
    "relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-[6px] text-sm font-medium transition-colors",
    featured
      ? "bg-brand-500 text-white hover:bg-brand-400"
      : "border border-line-strong text-fg hover:border-brand-400/70 hover:bg-brand-500/10",
    className,
  );

  if (!orderable) {
    return (
      <Link href="/support/#contact" aria-label={`Request a quote for ${planName}`} className={base}>
        Request a quote
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Configure ${planName} — add to cart`}
      onClick={() => {
        addToCart(planId);
        setAdded(true);
        router.push("/cart/");
      }}
      className={base}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {added ? "Added" : "Configure"}
    </button>
  );
}
