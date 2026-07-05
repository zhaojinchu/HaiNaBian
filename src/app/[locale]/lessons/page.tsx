import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { LessonCard } from "@/components/lessons/LessonCard";
import { lessons } from "@/content/lessons";
import { createPageMetadata } from "@/lib/metadata";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createPageMetadata((await params).locale, "lessonsTitle", "lessons");
}

export default async function LessonsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Lessons");
  const common = await getTranslations("Common");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <section className="section">
        <div className="shell grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} locale={locale} />
          ))}
        </div>
      </section>
      <section className="pb-20 sm:pb-28">
        <div className="shell">
          <h2 className="mb-8 font-display text-3xl font-semibold">{t("visualTitle")}</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <PlaceholderImage label={t("visualOne")} className="min-h-80" />
            <PlaceholderImage label={t("visualTwo")} className="min-h-80" />
          </div>
        </div>
      </section>
      <section className="pb-20 sm:pb-28">
        <div className="shell">
          <div className="rounded-[1.75rem] border border-line bg-paper-deep p-7 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-10">
            <div>
              <h2 className="font-display text-3xl font-semibold">{t("customTitle")}</h2>
              <p className="mt-3 max-w-2xl text-ink-soft">{t("customText")}</p>
            </div>
            <Link href="/contact" className={buttonClasses("primary", "mt-6 shrink-0 sm:mt-0")}>
              {common("book")} <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
