import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { brand } from "@/lib/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />

      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>

      <p className="pb-6 text-center font-mono text-[11px] tracking-wider text-subtle">
        {brand.network} · {brand.asn} · STAFF ACCESS ONLY
      </p>
    </main>
  );
}
