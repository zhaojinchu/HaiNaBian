import type { Metadata } from "next";
import { Mail, MapPin, MessageSquareText, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
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
    [Mail, siteContent.email],
    [Phone, siteContent.phone],
    [MessageSquareText, siteContent.wechat],
    [MapPin, siteContent.location[locale]],
  ] as const;

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
      <section className="section">
        <div className="shell grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
          <ContactForm />
          <aside className="h-fit rounded-[1.5rem] border border-line bg-paper-deep/70 p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl font-semibold">{t("detailsTitle")}</h2>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{t("detailsText")}</p>
            <ul className="mt-6 space-y-4">
              {details.map(([Icon, value]) => (
                <li key={value} className="flex items-start gap-3 text-sm">
                  <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
