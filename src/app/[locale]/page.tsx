import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpenText,
  HeartHandshake,
  MessageCircleMore,
  Route,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { createPageMetadata } from "@/lib/metadata";
import { audiences, processSteps } from "@/content/site";
import { lessons } from "@/content/lessons";
import { pricing } from "@/content/pricing";
import { testimonials } from "@/content/testimonials";
import { buttonClasses } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { LessonCard } from "@/components/lessons/LessonCard";
import { PricingCard } from "@/components/pricing/PricingCard";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { FaqAccordion, type FaqItem } from "@/components/faq/FaqAccordion";
import { CallToAction } from "@/components/sections/CallToAction";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata(locale, "homeTitle");
}

const audienceIcons = [Sparkles, Route, UsersRound];
const approachIcons = [HeartHandshake, MessageCircleMore, BookOpenText];

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const common = await getTranslations("Common");
  const faq = await getTranslations("FAQ");
  const faqItems = faq.raw("items") as FaqItem[];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="paper-grid absolute inset-0 opacity-55" />
        <div className="shell relative grid min-h-[calc(100svh-4.75rem)] items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.85fr] lg:py-24">
          <div className="fade-rise">
            <p className="text-xs font-bold tracking-[0.22em] text-accent uppercase">
              {t("heroKicker")}
            </p>
            <p className="mt-5 font-display text-2xl font-semibold tracking-[0.14em]">海那边</p>
            <h1 className="ink-underline mt-4 max-w-3xl font-display text-5xl leading-[1.15] font-semibold tracking-tight sm:text-6xl lg:text-[4.5rem]">
              {t("heroTitle")}
            </h1>
            <p className="mt-9 max-w-xl text-lg leading-9 text-ink-soft sm:text-xl">
              {t("heroDescription")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className={buttonClasses("primary")}>
                {common("book")} <ArrowRight className="size-4" />
              </Link>
              <Link href="/lessons" className={buttonClasses("secondary")}>
                {common("learnLessons")}
              </Link>
            </div>
            <p className="mt-5 text-xs text-ink-soft">{t("heroNote")}</p>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mr-0">
            <div className="aspect-[4/5] rounded-[45%_45%_2rem_2rem] border border-line bg-white-soft p-5 shadow-soft">
              <div className="relative grid h-full place-items-center overflow-hidden rounded-[42%_42%_1.25rem_1.25rem] bg-paper-deep">
                <span className="font-display text-[11rem] leading-none text-accent/12" aria-hidden="true">学</span>
                <div className="absolute right-8 bottom-10 left-8">
                  <div className="h-px bg-accent/50" />
                  <p className="mt-3 text-xs tracking-[0.18em] text-ink-soft uppercase">
                    {locale === "zh" ? "理解 · 表达 · 连接" : "Understand · Express · Connect"}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -right-5 -bottom-5 size-28 rounded-full border border-accent/30" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeading
            eyebrow={t("audienceEyebrow")}
            title={t("audienceTitle")}
            intro={t("audienceIntro")}
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {audiences.map((audience, index) => {
              const Icon = audienceIcons[index];
              return (
                <article key={audience.title.en} className="rounded-[1.5rem] border border-line bg-white-soft p-6">
                  <Icon className="size-6 text-accent" strokeWidth={1.5} aria-hidden="true" />
                  <h3 className="mt-5 font-display text-xl font-semibold">{audience.title[locale]}</h3>
                  <p className="mt-3 text-sm leading-7 text-ink-soft">{audience.description[locale]}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section bg-paper-deep/60">
        <div className="shell">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow={t("lessonsEyebrow")}
              title={t("lessonsTitle")}
              intro={t("lessonsIntro")}
            />
            <Link href="/lessons" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-accent-dark">
              {common("viewAll")} <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {lessons.slice(0, 3).map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <SectionHeading
            eyebrow={t("approachEyebrow")}
            title={t("approachTitle")}
            intro={t("approachIntro")}
          />
          <div className="space-y-4">
            {(["One", "Two", "Three"] as const).map((suffix, index) => {
              const Icon = approachIcons[index];
              return (
                <article key={suffix} className="flex gap-5 rounded-[1.5rem] border border-line bg-white-soft p-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-pale">
                    <Icon className="size-5 text-accent-dark" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold">{t(`approach${suffix}`)}</h3>
                    <p className="mt-2 text-sm leading-7 text-ink-soft">{t(`approach${suffix}Text`)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section border-y border-line bg-white-soft/45">
        <div className="shell">
          <SectionHeading eyebrow={t("processEyebrow")} title={t("processTitle")} />
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <li key={step.title.en} className="relative border-t border-accent/35 pt-6">
                <span className="font-display text-4xl text-accent/35">0{index + 1}</span>
                <h3 className="mt-4 font-display text-xl font-semibold">{step.title[locale]}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-soft">{step.description[locale]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="shell grid gap-10 lg:grid-cols-2 lg:items-center">
          <PlaceholderImage
            label={locale === "zh" ? "老师肖像或教学环境照片占位" : "Teacher portrait or teaching environment placeholder"}
            className="min-h-[30rem]"
          />
          <div>
            <SectionHeading eyebrow={t("teacherEyebrow")} title={t("teacherTitle")} intro={t("teacherText")} />
            <Link href="/about" className={buttonClasses("secondary", "mt-7")}>
              {common("readMore")} <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-paper-deep/60">
        <div className="shell">
          <SectionHeading eyebrow={t("testimonialEyebrow")} title={t("testimonialTitle")} />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeading eyebrow={t("pricingEyebrow")} title={t("pricingTitle")} />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pricing.slice(0, 3).map((option) => (
              <PricingCard key={option.id} option={option} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white-soft/50">
        <div className="shell grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeading eyebrow={t("faqEyebrow")} title={t("faqTitle")} />
          <div>
            <FaqAccordion items={faqItems} limit={5} />
            <Link href="/faq" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-dark">
              {common("viewAll")} <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <CallToAction title={t("ctaTitle")} text={t("ctaText")} />
    </>
  );
}
