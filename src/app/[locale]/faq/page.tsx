import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { FaqAccordion, type FaqItem } from "@/components/faq/FaqAccordion";
import { CallToAction } from "@/components/sections/CallToAction";
import { createPageMetadata } from "@/lib/metadata";
import type { AppLocale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createPageMetadata((await params).locale, "faqTitle", "faq");
}

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("FAQ");
  const home = await getTranslations("Home");
  const items = t.raw("items") as FaqItem[];

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <section className="section">
        <div className="shell max-w-4xl">
          <FaqAccordion items={items} />
        </div>
      </section>
      <CallToAction title={home("ctaTitle")} text={home("ctaText")} />
    </>
  );
}
