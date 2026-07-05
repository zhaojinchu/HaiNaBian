import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";

type TitleKey =
  | "homeTitle"
  | "aboutTitle"
  | "pricingTitle"
  | "contactTitle";

export async function createPageMetadata(
  locale: AppLocale,
  titleKey: TitleKey,
  path = "",
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Meta" });
  const localizedPath = path ? `/${path}` : "";

  return {
    title: t(titleKey),
    description: t("homeDescription"),
    alternates: {
      canonical: `/${locale}${localizedPath}`,
      languages: {
        zh: `/zh${localizedPath}`,
        en: `/en${localizedPath}`,
      },
    },
    openGraph: {
      title: t(titleKey),
      description: t("homeDescription"),
      locale: locale === "zh" ? "zh_CN" : "en_AE",
      type: "website",
      images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
    },
  };
}
