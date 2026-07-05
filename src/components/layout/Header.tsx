"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/pricing", key: "pricing" },
  { href: "/contact", key: "contact" },
] as const;

export function Header() {
  const t = useTranslations("Nav");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function switchLocale(nextLocale: AppLocale) {
    setOpen(false);
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/92 backdrop-blur-md">
      <div className="shell flex h-[4.75rem] items-center justify-between gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="海那边">
          <span
            className="grid size-8 place-items-center rounded-full border border-accent/40"
            aria-hidden="true"
          >
            <span className="h-px w-4 -rotate-12 bg-accent" />
          </span>
          <span>
            <span className="font-brand block text-2xl leading-none tracking-[0.08em]">
              海那边
            </span>
            <span className="mt-1 block text-[0.6rem] tracking-[0.14em] text-ink-soft uppercase">
              {locale === "zh" ? "迪拜中文课堂" : "Chinese Lessons in Dubai"}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm transition hover:text-accent-dark",
                  active ? "bg-accent-pale/60 text-accent-dark" : "text-ink-soft",
                )}
                aria-current={active ? "page" : undefined}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center rounded-full border border-line bg-white-soft p-1 text-xs"
            aria-label={t("language")}
          >
            <button
              type="button"
              onClick={() => switchLocale("zh")}
              className={cn(
                "min-h-8 rounded-full px-2.5 transition",
                locale === "zh" && "bg-accent-pale text-accent-dark",
              )}
              aria-pressed={locale === "zh"}
            >
              中文
            </button>
            <span className="text-line" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => switchLocale("en")}
              className={cn(
                "min-h-8 rounded-full px-2.5 transition",
                locale === "en" && "bg-accent-pale text-accent-dark",
              )}
              aria-pressed={locale === "en"}
            >
              EN
            </button>
          </div>
          <Link href="/contact" className={buttonClasses("primary", "hidden xl:inline-flex")}>
            {t("enquire")}
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-line bg-white-soft lg:hidden"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-navigation"
          className="border-t border-line bg-paper px-4 py-5 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="shell flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="min-h-11 rounded-xl px-4 py-2 text-base hover:bg-accent-pale/50"
              >
                {t(item.key)}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className={buttonClasses("primary", "mt-3 w-full")}>
              {t("enquire")}
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
