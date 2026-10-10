import { Address, Co, Email, LegalPage } from "@/components/content/legal";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("Privacy Policy", "How Offerhost collects, uses and protects personal data, and your rights under the GDPR.", "/legal/privacy/");

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" description="How we handle personal data, under the EU General Data Protection Regulation (GDPR)." current="/legal/privacy/">
      <h2 id="controller">1. Who is responsible</h2>
      <p>
        The controller is <Co />, <Address />. Privacy questions: <Email k="privacyEmail" label="privacy email" />.
      </p>

      <h2 id="data">2. What we collect</h2>
      <ul>
        <li><strong>Account and billing data</strong>: name, company, address, email, phone, VAT ID, invoices and payment status.</li>
        <li><strong>Support data</strong>: the content of tickets, chats, emails and calls.</li>
        <li><strong>Technical data</strong>: IP addresses assigned to you, traffic volumes, flow samples used for DDoS detection, and logs of panel and API access.</li>
        <li><strong>Website data</strong>: this website is a static site. It stores your cart in your own browser (localStorage) and does not set tracking cookies.</li>
      </ul>

      <h2 id="purposes">3. Why, and on what legal basis</h2>
      <ul>
        <li>To deliver and bill the services you order — performance of a contract (Art. 6(1)(b) GDPR).</li>
        <li>To keep invoices and accounting records — legal obligation (Art. 6(1)(c)).</li>
        <li>To protect our network, detect attacks and handle abuse reports — legitimate interest (Art. 6(1)(f)).</li>
        <li>To send service notices such as maintenance and incident updates — performance of a contract.</li>
      </ul>

      <h2 id="sharing">4. Who we share it with</h2>
      <p>
        We use processors for payments, email and hosting of our own systems, under data processing agreements. We register IP
        assignments in the RIPE database where RIPE policy requires it. We disclose data to authorities only when legally obliged.
        We do not sell personal data.
      </p>

      <h2 id="transfers">5. Transfers outside the EEA</h2>
      <p>Where a processor is outside the European Economic Area, we rely on an adequacy decision or the EU Standard Contractual Clauses.</p>

      <h2 id="retention">6. How long we keep it</h2>
      <ul>
        <li>Account data: for the duration of the contract and up to 2 years after.</li>
        <li>Invoices and accounting records: for the period required by tax law.</li>
        <li>Network and access logs: as short as possible for security purposes, normally no longer than 90 days.</li>
      </ul>

      <h2 id="customer-data">7. Data on your server</h2>
      <p>We do not access the data you store on your server. For that data you are the controller and we act as processor; a data processing agreement is available on request.</p>

      <h2 id="rights">8. Your rights</h2>
      <p>
        You can ask for access, correction, deletion, restriction or a copy of your data, and object to processing based on
        legitimate interest. Email <Email k="privacyEmail" label="privacy email" />. You may also complain to your data protection
        authority.
      </p>

      <h2 id="security">9. Security</h2>
      <p>We protect personal data with access control, encryption in transit and least-privilege access for staff.</p>

      <h2 id="changes">10. Changes</h2>
      <p>We will post updates here and change the date at the top. Material changes are announced to customers by email.</p>
    </LegalPage>
  );
}
