import type { Metadata } from "next";
import { Info } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { PricingCard } from "@/components/pricing/PricingCard";
import { CallToAction } from "@/components/sections/CallToAction";
import { pricing } from "@/content/pricing";
import { createPageMetadata } from "@/lib/metadata";
import type { AppLocale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createPageMetadata((await params).locale, "pricingTitle", "pricing");
}

export default async function PricingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pricing");
  const home = await getTranslations("Home");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <section className="section">
        <div className="shell grid gap-5 md:grid-cols-3">
          {pricing.map((option) => (
            <PricingCard key={option.id} option={option} locale={locale} />
          ))}
        </div>
        <div className="shell mt-10">
          <div className="flex gap-4 rounded-2xl border border-line bg-white-soft p-5 text-sm text-ink-soft">
            <Info className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-ink">{t("noticeTitle")}</h2>
              <p className="mt-1">{t("notice")}</p>
            </div>
          </div>
        </div>
      </section>
      <CallToAction title={home("ctaTitle")} text={home("ctaText")} />
    </>
  );
}
