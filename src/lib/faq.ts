import { contact, ddos, planDefaults, refunds } from "./facts";
import { brand } from "./site";

/** FAQ shown (expanded) on /support/ and emitted as FAQPage structured data. Plain text only. */
export type Faq = { q: string; a: string; pending?: boolean };

const or = (v: string | null, text: (v: string) => string) => (v ? text(v) : null);

export function faqs(): Faq[] {
  const list: { q: string; a: string | null }[] = [
    {
      q: "How quickly is my server delivered?",
      a: "Each plan shows its current stock and delivery time on the plan card and on the full specification table. In-stock servers are provisioned automatically once payment is confirmed.",
    },
    {
      q: "Are prices shown with or without VAT?",
      a:
        planDefaults.pricesIncludeVat === null
          ? null
          : planDefaults.pricesIncludeVat
            ? "Prices include VAT."
            : "Prices exclude VAT. EU businesses with a valid VAT ID are invoiced under the reverse-charge rule; other customers pay the VAT rate of their country.",
    },
    {
      q: "Is there a setup fee or minimum term?",
      a:
        planDefaults.setupFee === null || planDefaults.minimumTerm === null
          ? null
          : `Setup fee: ${planDefaults.setupFee === 0 ? "none" : `€${planDefaults.setupFee}`}. Minimum term: ${planDefaults.minimumTerm}.`,
    },
    {
      q: "Can I get a refund?",
      a: or(refunds.moneyBackWindow, (w) => `New customers can cancel within ${w} for a refund. Details are in the Refunds & Cancellation policy.`),
    },
    {
      q: "Is DDoS protection included?",
      a:
        ddos.includedInAllPlans === null || !ddos.filteringProvider
          ? null
          : `${ddos.includedInAllPlans ? "Yes, on every server." : "It is available as an upgrade."} Filtering is done by ${ddos.filteringProvider}. The DDoS page lists the capacity and exactly when an IP is null-routed.`,
    },
    {
      q: "Which operating systems can I install?",
      a: or(planDefaults.osList?.join(", ") ?? null, (l) => `Automatic installation is available for ${l}. You can also mount your own ISO through the remote console.`),
    },
    {
      q: "Do I get full root access?",
      a: "Yes. The server is yours alone — no virtualisation layer and no shared resources. You have full root/administrator access.",
    },
    {
      q: "Can I bring my own IP space or announce my own ASN?",
      a: `Talk to us. ${brand.asn} is a RIPE NCC-registered network and BGP sessions with customers are handled case by case.`,
    },
    {
      q: "How do I report abuse coming from your network?",
      a: or(contact.abuseEmail, (e) => `Email ${e} with the IP address, timestamps with time zone and evidence such as logs or full email headers.`),
    },
    {
      q: "Where can I check your network's track record?",
      a: `Look up ${brand.asn} on bgp.tools, RIPEstat or Hurricane Electric, run tests from our looking glass at lg.offerhost.com, and read past incidents on our status page.`,
    },
  ];
  return list.map((f) => ({ q: f.q, a: f.a ?? "", pending: f.a === null }));
}
