import type { Metadata } from "next";
import { Mail, MapPin, MessageSquareText, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { createPageMetadata } from "@/lib/metadata";
import { siteContent } from "@/content/site";
import type { AppLocale } from "@/i18n/routing";

type PageProps = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return createPageMetadata((await params).locale, "contactTitle", "contact");
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");
  const details = [
    [Phone, t("phone"), siteContent.phone[locale]],
    [MessageSquareText, t("wechat"), siteContent.wechat[locale]],
    [Mail, t("email"), siteContent.email[locale]],
  ] as const;

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <section className="section">
        <div className="shell max-w-4xl">
          <div className="grid gap-5 md:grid-cols-3">
            {details.map(([Icon, label, value]) => (
              <article key={label} className="rounded-[1.5rem] border border-line bg-white-soft p-6">
                <span className="grid size-11 place-items-center rounded-full bg-accent-pale">
                  <Icon className="size-5 text-accent-dark" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-display text-xl font-semibold">{label}</h2>
                <p className="mt-2 break-words text-sm leading-7 text-ink-soft">{value}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-4 rounded-2xl border border-line bg-paper-deep/70 p-5">
            <MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">{t("location")}</h2>
              <p className="mt-1 text-sm text-ink-soft">{siteContent.location[locale]}</p>
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-7 text-ink-soft">
            {t("messageHint")}
          </p>
        </div>
      </section>
    </>
  );
}
