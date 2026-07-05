import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { CallToAction } from "@/components/sections/CallToAction";
import { createPageMetadata } from "@/lib/metadata";
import type { AppLocale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createPageMetadata((await params).locale, "aboutTitle", "about");
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const home = await getTranslations("Home");
  const facts = [
    "qualifications",
    "experience",
    "languages",
    "overseas",
    "children",
    "environment",
  ] as const;

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} secondary={t("subtitle")} intro={t("intro")} />
      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <PlaceholderImage label={t("portrait")} className="min-h-[36rem]" />
            <div className="mt-5 rounded-2xl border border-line bg-white-soft p-5">
              <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">{t("nameLabel")}</p>
              <p className="mt-2 font-display text-xl font-semibold">{t("nameValue")}</p>
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold">{t("bioTitle")}</h2>
            <p className="mt-5 leading-8 text-ink-soft">{t("bio")}</p>
            <h2 className="mt-12 font-display text-3xl font-semibold">{t("factsTitle")}</h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact} className="rounded-2xl border border-line bg-white-soft p-5">
                  <dt className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />
                    {t(fact)}
                  </dt>
                  <dd className="mt-2 text-sm text-ink-soft">{t("factPending")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
      <section className="section bg-paper-deep/60">
        <div className="shell grid gap-10 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-line bg-white-soft p-7 sm:p-9">
            <h2 className="font-display text-3xl font-semibold">{t("philosophyTitle")}</h2>
            <p className="mt-5 leading-8 text-ink-soft">{t("philosophy")}</p>
          </div>
          <div className="rounded-[1.5rem] border border-accent/25 bg-accent-pale/25 p-7 sm:p-9">
            <h2 className="font-display text-3xl font-semibold">{t("nameNoteTitle")}</h2>
            <p className="mt-5 leading-8 text-ink-soft">{t("nameNote")}</p>
          </div>
        </div>
      </section>
      <CallToAction title={home("ctaTitle")} text={home("ctaText")} />
    </>
  );
}
