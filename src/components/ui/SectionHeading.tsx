import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="mb-3 text-xs font-bold tracking-[0.22em] text-accent uppercase">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {intro ? (
        <p className="mt-5 text-base leading-8 text-ink-soft sm:text-lg">{intro}</p>
      ) : null}
    </div>
  );
}
