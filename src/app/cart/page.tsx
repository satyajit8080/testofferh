import { PageShell } from "@/components/layout/PageShell";
import { CartView } from "@/components/cart/CartView";
import { pageMeta } from "@/lib/meta";

export const metadata = { ...pageMeta("Cart", "Your Offerhost server order.", "/cart/"), robots: { index: false, follow: true } };

export default function CartPage() {
  return (
    <PageShell eyebrow="Order" title="Your cart">
      <CartView />
    </PageShell>
  );
}
