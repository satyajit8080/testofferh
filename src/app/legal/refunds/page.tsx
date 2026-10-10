import { Email, LegalPage } from "@/components/content/legal";
import { F } from "@/components/ui/Tbc";
import { planDefaults, refunds } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("Refunds & Cancellation", "How to cancel an Offerhost service, notice periods and when you are entitled to a refund.", "/legal/refunds/");

export default function RefundsPage() {
  return (
    <LegalPage title="Refunds & Cancellation" description="How to cancel, and when you get money back." current="/legal/refunds/">
      <h2 id="cancel">1. Cancelling a service</h2>
      <ul>
        <li>Cancel from the client area or by ticket. Notice period: <F v={refunds.cancellationNotice} />.</li>
        <li>Minimum term: <F v={planDefaults.minimumTerm} />.</li>
        <li>The service runs until the end of the paid billing period, after which the server is wiped and the IP addresses are released.</li>
      </ul>

      <h2 id="money-back">2. Money-back guarantee</h2>
      <p>
        First orders: <F v={refunds.moneyBackWindow} label="Money-back window" />. Setup fees are{" "}
        <F v={refunds.setupFeesRefundable} fmt={(v) => (v ? "refunded" : "not refunded")} label="refundable?" />.
      </p>

      <h2 id="consumers">3. Consumers in the EU</h2>
      <p>
        If you order as a consumer, you have a 14-day right of withdrawal. Because servers are delivered on request before that
        period ends, you ask us to start immediately when you order; if you then withdraw, you pay for the days the service was
        provided.
      </p>

      <h2 id="not-refundable">4. Not refundable</h2>
      <ul>
        <li>Services terminated for breach of the Terms or Acceptable Use Policy.</li>
        <li>Unused time after you cancel mid-period, unless stated otherwise above.</li>
        <li>Domain registrations and third-party licences once ordered.</li>
      </ul>

      <h2 id="how">5. How refunds are paid</h2>
      <p>
        Refunds go back to the original payment method, normally within 14 days. Questions: <Email k="salesEmail" label="sales email" />.
      </p>
    </LegalPage>
  );
}
