import Link from "next/link";
import { Clock, Headset, Mail, MessageCircle, Phone, Ticket } from "lucide-react";
import { Email } from "@/components/content/legal";
import { PageShell, Panel } from "@/components/layout/PageShell";
import { F, Tbc } from "@/components/ui/Tbc";
import { contact, supportTargets } from "@/lib/facts";
import { faqs } from "@/lib/faq";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta(
  "Support & Contact",
  "Contact Offerhost support and sales: response-time targets, phone and live chat hours, tickets and answers to common questions.",
  "/support/",
);

export default function SupportPage() {
  const list = faqs();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.filter((f) => !f.pending).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const channels = [
    { icon: Ticket, title: "Support ticket", value: contact.ticketUrl ? <a href={contact.ticketUrl} className="text-brand-300 underline">Open a ticket</a> : <Tbc label="Ticket desk URL" />, hours: "24/7" },
    { icon: MessageCircle, title: "Live chat", value: contact.liveChatUrl ? <a href={contact.liveChatUrl} className="text-brand-300 underline">Start a chat</a> : <Tbc label="Live chat" />, hours: <F v={contact.liveChatHours} /> },
    { icon: Phone, title: "Phone", value: contact.phone ? <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-brand-300 underline">{contact.phone}</a> : <Tbc label="Phone number" />, hours: <F v={contact.phoneHours} /> },
    { icon: Mail, title: "Email support", value: <Email k="supportEmail" label="support email" />, hours: "24/7" },
    { icon: Headset, title: "Sales", value: <Email k="salesEmail" label="sales email" />, hours: <F v={contact.phoneHours} /> },
  ];

  return (
    <PageShell eyebrow="Support" title="Talk to a human." description="Engineers who run the network answer your tickets. Here is how to reach us and how fast we respond.">
      <div className="grid gap-6">
        <section id="contact" aria-labelledby="contact-title" className="scroll-mt-32">
          <h2 id="contact-title" className="sr-only">Contact channels</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {channels.map(({ icon: Icon, title, value, hours }) => (
              <li key={title} className="rounded-[10px] border border-line bg-ink-900/70 p-5">
                <Icon className="h-5 w-5 text-brand-400" strokeWidth={1.6} />
                <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm">{value}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[12px] text-subtle">
                  <Clock className="h-3.5 w-3.5" /> {hours}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <Panel id="response-times" title="Response-time targets">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-subtle">
                  <th className="py-2 pr-4 font-normal">Priority</th>
                  <th className="py-2 pr-4 font-normal">For example</th>
                  <th className="py-2 font-normal">First response</th>
                </tr>
              </thead>
              <tbody>
                {supportTargets.map((t) => (
                  <tr key={t.priority} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-4 text-white">{t.priority}</td>
                    <td className="py-2.5 pr-4 text-muted">{t.description}</td>
                    <td className="py-2.5"><F v={t.firstResponse} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13px] text-muted">
            These targets are part of our <Link href="/legal/sla/" className="text-brand-300 underline">SLA</Link>. Network incidents are posted on the{" "}
            <Link href="/status/" className="text-brand-300 underline">status page</Link> first.
          </p>
        </Panel>

        <Panel id="faq" title="Frequently asked questions">
          <dl className="divide-y divide-line">
            {list.map((f) => (
              <div key={f.q} className="py-4 first:pt-0 last:pb-0">
                <dt className="font-medium text-white">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-fg/85">{f.pending ? <Tbc label="Answer depends on a fact to confirm" /> : f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-muted">
            More how-tos in the <Link href="/kb/" className="text-brand-300 underline">knowledge base</Link>.
          </p>
        </Panel>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </PageShell>
  );
}
