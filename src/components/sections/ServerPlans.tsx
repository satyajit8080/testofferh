import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredPlans } from "@/lib/site";
import { resolvePlan } from "@/lib/plans";
import { ServerCard } from "./ServerCard";
import { LocationSelector } from "./LocationSelector";

export function ServerPlans() {
  return (
    <section id="servers" aria-labelledby="servers-title" className="relative scroll-mt-24 py-24 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="servers-title"
            eyebrow="Dedicated Servers"
            title={
              <>
                Powerful Servers.
                <br />
                <span className="text-muted">Transparent Pricing.</span>
              </>
            }
            description="Enterprise hardware designed for hosting, virtualization, applications, storage and demanding workloads."
          />
          <Reveal delay={0.1}>
            <Link
              href="/servers/"
              className="group inline-flex items-center gap-2 text-sm font-medium text-brand-400 transition-colors hover:text-glow"
            >
              Compare all servers & full specs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featuredPlans.map((plan, i) => (
            <ServerCard key={plan.id} plan={resolvePlan(plan)} index={i} />
          ))}
        </div>

        <LocationSelector />
      </Container>
    </section>
  );
}
