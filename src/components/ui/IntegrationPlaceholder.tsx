import type { ReactNode } from "react";
import { Braces } from "lucide-react";

export function IntegrationPlaceholder({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-accent/50 bg-accent-pale/25 p-6 sm:p-9">
      <Braces className="mb-5 size-7 text-accent" aria-hidden="true" />
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-2xl text-ink-soft">{text}</p>
      {children}
    </div>
  );
}
