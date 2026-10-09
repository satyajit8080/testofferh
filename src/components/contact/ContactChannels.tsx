import Link from "next/link";
import { Activity, ArrowRight, ArrowUpRight, Briefcase, LifeBuoy, Mail, Phone, ShieldAlert } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { brand, contact } from "@/lib/site";

type Line = { icon: typeof Mail; label: string; href: string; external?: boolean };

/** Builds the contact lines for a card, skipping any detail that hasn't been filled in yet. */
function lines(...items: (Line | false | "")[]) {
  return items.filter(Boolean) as Line[];
}

const mail = (email: string): Line | false => !!email && { icon: Mail, label: email, href: `mailto:${email}` };

function Card({
  icon: Icon,
  eyebrow,
  title,
  children,
  items,
  delay,
}: {
  icon: typeof Mail;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  items: Line[];
  delay: number;
}) {
  return (
    <Reveal delay={delay} className="group glass rounded-[10px] p-5 transition-colors duration-300 hover:border-brand-400/40">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line bg-brand-500/10 text-brand-400 transition-colors duration-300 group-hover:border-brand-400/60 group-hover:text-glow">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">{eyebrow}</p>
          <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-white">{title}</h3>
          <div className="mt-1.5 text-[13px] leading-relaxed text-muted">{children}</div>
          {items.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {items.map(({ icon: LineIcon, label, href, external }) => (
                <li key={href}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="inline-flex max-w-full items-center gap-2 break-all font-mono text-[12.5px] text-fg/90 transition-colors hover:text-white"
                  >
                    <LineIcon className="h-3.5 w-3.5 shrink-0 text-brand-400" />
                    {label}
                    {external && <ArrowUpRight className="h-3 w-3 shrink-0 text-subtle" />}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export function ContactChannels() {
  const { sales, support, abuse, company } = contact;

  return (
    <div className="space-y-4">
      <Card
        icon={Briefcase}
        eyebrow="Sales"
        title="Dedicated servers & quotes"
        delay={0.05}
        items={lines(mail(sales.email), !!sales.phone && { icon: Phone, label: sales.phone, href: `tel:${sales.phone.replace(/[^\d+]/g, "")}` })}
      >
        Pricing, custom configurations, volume orders and new deployments.
      </Card>

      <Card
        icon={LifeBuoy}
        eyebrow="Technical Support"
        title="Help with an existing service"
        delay={0.1}
        items={lines(
          mail(support.email),
          !!support.portalUrl && { icon: ArrowRight, label: "Open a support ticket", href: support.portalUrl },
        )}
      >
        Existing customers can reach our infrastructure team for server, network and access issues.
      </Card>

      <Card
        icon={ShieldAlert}
        eyebrow="Abuse / NOC"
        title={`Network abuse on ${brand.asn}`}
        delay={0.15}
        items={lines(mail(abuse.email), mail(abuse.nocEmail))}
      >
        Report spam, attacks or other abuse originating from {brand.asn} ({brand.rir}). Please include IP addresses,
        timestamps with timezone, and logs.
      </Card>

      <Reveal delay={0.2} className="glass ticks rounded-[10px] p-5">
        <p className="flex items-center gap-2 text-[14px] font-semibold text-white">
          <Activity className="h-4 w-4 text-brand-400" />
          Network status
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Check for known incidents and scheduled maintenance before opening a ticket.
        </p>
        <Link
          href="/status/"
          className="group mt-4 flex h-10 items-center justify-center gap-2 rounded-[6px] border border-line-strong text-sm text-fg transition-colors hover:border-brand-400/70 hover:bg-brand-500/10"
        >
          View System Status
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Reveal>

      <Reveal delay={0.25} className="rounded-[10px] border border-line bg-ink-900/60 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">Response times</p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Every request is read by our team and answered as soon as possible, with network-affecting and abuse reports
          prioritised. Contracted response times, where applicable, are set out in your service agreement.
        </p>
        {(company.legalName || company.address) && (
          <address className="mt-4 border-t border-line pt-4 text-[12.5px] not-italic leading-relaxed text-subtle">
            {company.legalName && <span className="block text-fg/80">{company.legalName}</span>}
            {company.address && <span className="block whitespace-pre-line">{company.address}</span>}
          </address>
        )}
      </Reveal>
    </div>
  );
}
