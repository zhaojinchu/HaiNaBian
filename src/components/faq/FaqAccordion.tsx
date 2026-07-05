"use client";

import { ChevronDown } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({
  items,
  limit,
}: {
  items: FaqItem[];
  limit?: number;
}) {
  const visible = typeof limit === "number" ? items.slice(0, limit) : items;
  return (
    <div className="divide-y divide-line border-y border-line">
      {visible.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 font-medium marker:hidden">
            <span>{item.q}</span>
            <ChevronDown
              className="size-5 shrink-0 text-accent transition group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="max-w-3xl pb-6 pr-10 text-sm leading-7 text-ink-soft">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
