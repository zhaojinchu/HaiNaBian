import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { createPageMetadata } from "@/lib/metadata";
import { buttonClasses } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata(locale, "homeTitle");
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const common = await getTranslations("Common");

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="paper-grid absolute inset-0 opacity-55" />
        <div className="shell relative grid min-h-[calc(100svh-4.75rem)] items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.85fr] lg:py-24">
          <div className="fade-rise">
            <p className="text-xs font-bold tracking-[0.22em] text-accent uppercase">
              {t("heroKicker")}
            </p>
            <p className="font-brand mt-5 text-3xl tracking-[0.14em]">海那边</p>
            <h1 className="ink-underline mt-4 max-w-3xl font-display text-5xl leading-[1.15] font-semibold tracking-tight sm:text-6xl lg:text-[4.5rem]">
              {t("heroTitle")}
            </h1>
            <p className="mt-9 max-w-xl text-lg leading-9 text-ink-soft sm:text-xl">
              {t("heroDescription")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className={buttonClasses("primary")}>
                {common("contact")} <ArrowRight className="size-4" />
              </Link>
              <Link href="/pricing" className={buttonClasses("secondary")}>
                {common("viewOptions")}
              </Link>
            </div>
            <p className="mt-5 text-xs text-ink-soft">{t("heroNote")}</p>
          </div>

          <div className="hidden min-h-[28rem] lg:block" aria-hidden="true" />
        </div>
      </section>

      <section className="section bg-white-soft/45">
        <div className="shell grid gap-10 lg:grid-cols-2 lg:items-center">
          <PlaceholderImage
            label={locale === "zh" ? "老师肖像或教学环境照片占位" : "Teacher portrait or teaching environment placeholder"}
            className="min-h-[24rem]"
          />
          <div>
            <SectionHeading eyebrow={t("teacherEyebrow")} title={t("teacherTitle")} intro={t("teacherText")} />
            <Link href="/about" className={buttonClasses("secondary", "mt-7")}>
              {common("readMore")} <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
