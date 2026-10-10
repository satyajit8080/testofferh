import { LegalPage } from "@/components/content/legal";
import { F, Tbc } from "@/components/ui/Tbc";
import { sla, supportTargets } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("Service Level Agreement", "Offerhost network availability commitment, hardware replacement times, support response targets and service credits.", "/legal/sla/");

export default function SlaPage() {
  return (
    <LegalPage title="Service Level Agreement" description="What we commit to, how we measure it, and the credit you get when we miss it." current="/legal/sla/">
      <h2 id="commitments">1. Commitments</h2>
      <ul>
        <li>Network availability: <F v={sla.networkUptime} /> per calendar month.</li>
        <li>Hardware replacement after a confirmed hardware fault: <F v={sla.hardwareReplacement} />.</li>
        <li>Support first-response targets: see the table below.</li>
      </ul>

      <h2 id="measurement">2. How availability is measured</h2>
      <p>
        <F v={sla.measurement} label="Measurement method" />
      </p>
      <p>
        Network unavailability means your server cannot send or receive traffic because of a fault in the Offerhost network
        (AS208220). Incidents are published on the <a href="/status/">status page</a>.
      </p>

      <h2 id="credits">3. Service credits</h2>
      {sla.credits ? (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-subtle">
              <th className="py-2 font-normal">Monthly availability</th>
              <th className="py-2 font-normal">Credit (of monthly fee)</th>
            </tr>
          </thead>
          <tbody>
            {sla.credits.map((c) => (
              <tr key={c.availability} className="border-b border-line">
                <td className="py-2">{c.availability}</td>
                <td className="py-2">{c.credit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>
          Credit table: <Tbc />
        </p>
      )}
      <p>
        Credits are capped at <F v={sla.maxCredit} /> of the affected service&apos;s monthly fee, are applied to your next invoice,
        and are not paid out in cash.
      </p>

      <h2 id="support">4. Support response targets</h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-subtle">
            <th className="py-2 font-normal">Priority</th>
            <th className="py-2 font-normal">Example</th>
            <th className="py-2 font-normal">First response</th>
          </tr>
        </thead>
        <tbody>
          {supportTargets.map((t) => (
            <tr key={t.priority} className="border-b border-line">
              <td className="py-2 pr-4">{t.priority}</td>
              <td className="py-2 pr-4 text-muted">{t.description}</td>
              <td className="py-2">
                <F v={t.firstResponse} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 id="claims">5. How to claim</h2>
      <p>
        Open a support ticket within <F v={sla.claimWindow} /> after the end of the month in which the incident happened, with the
        affected server and the times of the outage.
      </p>

      <h2 id="exclusions">6. Exclusions</h2>
      <ul>
        <li>Scheduled maintenance announced at least 48 hours in advance on the status page.</li>
        <li>Faults caused by your software, configuration or actions, including a server you have taken offline.</li>
        <li>Null-routing or filtering of traffic during a DDoS attack, as described on the <a href="/ddos/">DDoS page</a>.</li>
        <li>Suspension under the Terms of Service or Acceptable Use Policy.</li>
        <li>Force majeure.</li>
      </ul>
    </LegalPage>
  );
}
