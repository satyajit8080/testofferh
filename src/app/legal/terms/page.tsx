import { Address, Co, Email, LegalPage } from "@/components/content/legal";
import { F } from "@/components/ui/Tbc";
import { company, planDefaults, refunds } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("Terms of Service", "The terms that apply to Offerhost dedicated servers, IP addresses and related services.", "/legal/terms/");

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" description="The agreement between you and Offerhost for dedicated servers and related services." current="/legal/terms/">
      <h2 id="parties">1. Parties</h2>
      <p>
        These terms form the agreement between <Co />, <Address /> (&ldquo;Offerhost&rdquo;, &ldquo;we&rdquo;) and the customer
        who places an order (&ldquo;you&rdquo;). Our services are offered to businesses and to consumers; where consumer law gives
        you stronger rights, those rights apply.
      </p>

      <h2 id="services">2. Services</h2>
      <p>
        We provide dedicated servers, IP addresses, network connectivity and the add-ons listed on our website. The specification of
        each service is the one shown on the order page at the time you order. Hardware is our property and remains in our data
        centres; you receive administrative access to the operating system.
      </p>

      <h2 id="ordering">3. Ordering and delivery</h2>
      <ul>
        <li>An order is accepted when we confirm it by email or when the service is delivered, whichever comes first.</li>
        <li>We may refuse or cancel an order, for example when payment fails, verification fails or the use would breach our Acceptable Use Policy. Any payment is then refunded.</li>
        <li>Delivery times shown on the website are estimates, not guarantees.</li>
      </ul>

      <h2 id="fees">4. Fees and payment</h2>
      <ul>
        <li>Services are billed in advance for each billing period. Prices are shown in euros, <F v={planDefaults.pricesIncludeVat} fmt={(v) => (v ? "including" : "excluding")} label="incl./excl." /> VAT.</li>
        <li>One-time setup fees, where they apply, are shown before you order.</li>
        <li>Unpaid invoices may lead to suspension after a reminder. Services suspended for non-payment may be terminated and their data deleted after a further notice period.</li>
        <li>We may change prices with at least 30 days&apos; notice; the change applies from your next billing period and you may cancel before it takes effect.</li>
      </ul>

      <h2 id="term">5. Term and cancellation</h2>
      <p>
        The minimum term is <F v={planDefaults.minimumTerm} />. After that, the service renews automatically for the same billing
        period until cancelled. Notice period: <F v={refunds.cancellationNotice} />. See the{" "}
        <a href="/legal/refunds/">Refunds &amp; Cancellation policy</a> for details.
      </p>

      <h2 id="use">6. Your responsibilities</h2>
      <ul>
        <li>You are responsible for everything that runs on your server, including security updates, backups and the content you host.</li>
        <li>You must comply with our <a href="/legal/aup/">Acceptable Use Policy</a> and applicable law.</li>
        <li>You keep your account credentials and SSH keys confidential.</li>
        <li>You provide accurate contact and billing details and keep them current.</li>
      </ul>

      <h2 id="backups">7. Data and backups</h2>
      <p>
        Unless you buy a backup service, we do not back up the data on your server. When a service ends, its disks are wiped and
        the data cannot be recovered.
      </p>

      <h2 id="suspension">8. Suspension</h2>
      <p>
        We may suspend a service without prior notice when it is needed to protect our network or third parties, for example during
        an attack, when a server is compromised or for serious breaches of the Acceptable Use Policy. We will tell you why and restore
        the service once the cause is removed.
      </p>

      <h2 id="ip">9. IP addresses</h2>
      <p>
        IP addresses assigned to you remain registered to Offerhost ({`AS208220`}). You have no ownership right in them, and they are
        returned when the service ends.
      </p>

      <h2 id="sla">10. Availability</h2>
      <p>
        Our availability commitments and service credits are set out in the <a href="/legal/sla/">Service Level Agreement</a>.
        Service credits are your sole remedy for unavailability covered by the SLA.
      </p>

      <h2 id="liability">11. Liability</h2>
      <p>
        Except for intent or gross negligence, death or personal injury, or where the law does not allow it, our total liability per
        calendar year is limited to the fees you paid for the affected service in the twelve months before the event. We are not
        liable for indirect damage such as lost profit, lost data or business interruption.
      </p>

      <h2 id="force-majeure">12. Force majeure</h2>
      <p>We are not liable for failures caused by events outside our reasonable control, such as upstream outages, power grid failures, natural disasters or government measures.</p>

      <h2 id="privacy">13. Privacy</h2>
      <p>We process personal data as described in our <a href="/legal/privacy/">Privacy Policy</a>. Where we process personal data on your behalf on your server, we act as processor; a data processing agreement is available on request.</p>

      <h2 id="changes">14. Changes</h2>
      <p>We may update these terms. Material changes are announced by email at least 30 days in advance; if you do not agree, you may cancel before they take effect.</p>

      <h2 id="law">15. Governing law</h2>
      <p>
        These terms are governed by <F v={company.governingLaw} />. Disputes are submitted to the competent court of our registered
        seat, unless mandatory consumer law gives you the right to go to the court where you live.
      </p>

      <h2 id="contact">16. Contact</h2>
      <p>
        Questions about these terms: <Email k="salesEmail" label="sales email" />.
      </p>
    </LegalPage>
  );
}
