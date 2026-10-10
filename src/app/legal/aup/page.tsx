import { Email, LegalPage } from "@/components/content/legal";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("Acceptable Use Policy", "What you may and may not do on Offerhost servers and network (AS208220), and how to report abuse.", "/legal/aup/");

export default function AupPage() {
  return (
    <LegalPage title="Acceptable Use Policy" description="The rules that keep our network (AS208220) clean and reachable for every customer." current="/legal/aup/">
      <p>This policy is part of our <a href="/legal/terms/">Terms of Service</a> and applies to every service, including traffic sent by your users.</p>

      <h2 id="prohibited">1. Not allowed</h2>
      <ul>
        <li>Illegal content, including child sexual abuse material — reported to the authorities immediately.</li>
        <li>Unsolicited bulk email (spam), or hosting sites advertised by spam.</li>
        <li>Phishing, malware distribution, botnet command-and-control, or fraud.</li>
        <li>Attacks on other networks: DDoS, port scanning, brute-forcing, exploitation without the owner&apos;s permission.</li>
        <li>IP spoofing or announcing address space you are not authorised to use.</li>
        <li>Open resolvers, open relays or open proxies that can be abused by third parties.</li>
        <li>Infringing copyright or trademarks, after a valid notice.</li>
      </ul>

      <h2 id="resources">2. Fair use of the network</h2>
      <p>Your server must not disrupt the network for others. Traffic that harms the network — for example an attack you are sending or receiving — may be filtered, rate-limited or null-routed; see <a href="/ddos/">DDoS Protection</a>.</p>

      <h2 id="security">3. Security</h2>
      <p>You keep your server patched and secured. A compromised server that sends abusive traffic may be isolated until it is cleaned.</p>

      <h2 id="enforcement">4. Enforcement</h2>
      <ol>
        <li>We forward abuse reports to you and ask you to act within a stated time, normally 24 hours.</li>
        <li>If you do not respond, or the abuse continues, we may restrict or suspend the affected IP or service.</li>
        <li>For serious or repeated abuse, or when the network is at risk, we act immediately and may terminate the service without refund.</li>
      </ol>

      <h2 id="abuse">5. Reporting abuse</h2>
      <p>
        Send reports to <Email k="abuseEmail" label="abuse email" />, including the IP address, timestamps with time zone, and
        evidence such as logs or full email headers. The abuse contact for AS208220 is also listed in the RIPE database.
      </p>
    </LegalPage>
  );
}
