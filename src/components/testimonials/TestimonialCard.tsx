import { Quote } from "lucide-react";
import type { Locale, Testimonial } from "@/types/content";

export function TestimonialCard({
  testimonial,
  locale,
}: {
  testimonial: Testimonial;
  locale: Locale;
}) {
  return (
    <figure className="rounded-[1.5rem] border border-line bg-white-soft p-6">
      <Quote className="size-6 text-accent/70" strokeWidth={1.5} aria-hidden="true" />
      <blockquote className="mt-5 text-base leading-8 text-ink-soft">
        {testimonial.quote[locale]}
      </blockquote>
      <figcaption className="mt-5 text-xs font-bold tracking-[0.14em] text-accent uppercase">
        {testimonial.attribution[locale]}
      </figcaption>
    </figure>
  );
}
