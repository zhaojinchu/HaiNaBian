import type { Metadata } from "next";
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  HelpCircle,
  ListChecks,
  LockKeyhole,
  RefreshCcw,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { BookingProvider } from "@/components/integrations/BookingProvider";
import { FaqAccordion, type FaqItem } from "@/components/faq/FaqAccordion";
import { createPageMetadata } from "@/lib/metadata";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/Button";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createPageMetadata((await params).locale, "bookTitle", "book");
}

const stepIcons = [ListChecks, CalendarDays, FileText, CircleDollarSign, CheckCircle2];
const infoIcons = [Clock3, RefreshCcw, LockKeyhole, HelpCircle];

export default async function BookPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Book");
  const faq = await getTranslations("FAQ");
  const nav = await getTranslations("Nav");
  const allFaq = faq.raw("items") as FaqItem[];
  const bookingFaq = [allFaq[8], allFaq[9], allFaq[10], allFaq[11]];
  const steps = [1, 2, 3, 4, 5] as const;
  const info = ["timezone", "policy", "security", "fallback"] as const;

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <section className="section">
        <div className="shell">
          <h2 className="font-display text-3xl font-semibold">{t("stepsTitle")}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-5">
            {steps.map((step, index) => {
              const Icon = stepIcons[index];
              return (
                <li key={step} className="rounded-2xl border border-line bg-white-soft p-5">
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-accent" strokeWidth={1.5} aria-hidden="true" />
                    <span className="font-display text-xl text-accent/45">0{step}</span>
                  </div>
                  <h3 className="mt-5 font-semibold">{t(`step${step}`)}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{t(`step${step}Text`)}</p>
                </li>
              );
            })}
          </ol>
          <div className="mt-12">
            <BookingProvider />
          </div>
        </div>
      </section>
      <section className="section border-y border-line bg-paper-deep/60">
        <div className="shell grid gap-5 md:grid-cols-2">
          {info.map((item, index) => {
            const Icon = infoIcons[index];
            return (
              <article key={item} className="rounded-2xl border border-line bg-white-soft p-6">
                <Icon className="size-5 text-accent" aria-hidden="true" />
                <h2 className="mt-4 font-display text-xl font-semibold">{t(`${item}Title`)}</h2>
                <p className="mt-2 text-sm leading-7 text-ink-soft">{t(`${item}Text`)}</p>
                {item === "fallback" ? (
                  <Link href="/contact" className={buttonClasses("secondary", "mt-5")}>
                    {nav("contact")}
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
      <section className="section">
        <div className="shell max-w-4xl">
          <h2 className="mb-8 font-display text-3xl font-semibold">{faq("title")}</h2>
          <FaqAccordion items={bookingFaq} />
        </div>
      </section>
    </>
  );
}
