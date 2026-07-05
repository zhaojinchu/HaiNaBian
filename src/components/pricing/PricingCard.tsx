import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/Button";
import type { Locale, PriceOption } from "@/types/content";
import { cn } from "@/lib/utils";

export async function PricingCard({
  option,
  locale,
}: {
  option: PriceOption;
  locale: Locale;
}) {
  const t = await getTranslations("Pricing");
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-[1.5rem] border bg-white-soft p-6",
        option.recommended ? "border-accent shadow-soft" : "border-line",
      )}
    >
      {option.recommended ? (
        <span className="absolute -top-3 right-5 rounded-full bg-accent-dark px-3 py-1 text-xs font-bold text-white-soft">
          {t("recommended")}
        </span>
      ) : null}
      <h2 className="font-display text-2xl font-semibold">{option.name[locale]}</h2>
      <p className="mt-2 text-sm text-ink-soft">{option.duration[locale]}</p>
      <p className="mt-6 text-2xl font-semibold text-accent-dark">{option.price[locale]}</p>
      <p className="mt-1 text-sm text-ink-soft">{option.packageSize[locale]}</p>
      <h3 className="mt-7 border-t border-line pt-5 text-sm font-semibold">{t("includes")}</h3>
      <ul className="mt-3 flex-1 space-y-3 text-sm text-ink-soft">
        {option.includes[locale].map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
      <Link
        href="/contact"
        className={buttonClasses(option.recommended ? "primary" : "secondary", "mt-7 w-full")}
      >
        {t("enquire")}
      </Link>
    </article>
  );
}
