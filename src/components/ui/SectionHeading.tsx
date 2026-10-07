import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  id?: string;
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, align = "left", id, className }: Props) {
  return (
    <Reveal className={cn(align === "center" && "mx-auto text-center", "max-w-2xl", className)}>
      <p className="eyebrow flex items-center gap-3">
        <span className={cn("h-px w-6 bg-brand-400", align === "center" && "hidden")} />
        {eyebrow}
      </p>
      <h2 id={id} className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.025em] text-fg sm:text-4xl lg:text-[44px]">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-muted sm:text-[17px]">{description}</p>}
    </Reveal>
  );
}
