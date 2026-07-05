import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { routing } from "@/i18n/routing";
import "@fontsource/ma-shan-zheng";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://hainabian.example"),
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <a
            href="#main-content"
            className="fixed top-2 left-2 z-[100] -translate-y-20 rounded-full bg-ink px-4 py-2 text-paper transition focus:translate-y-0"
          >
            {locale === "zh" ? "跳到主要内容" : "Skip to main content"}
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
