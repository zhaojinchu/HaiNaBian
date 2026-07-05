import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteContent } from "@/content/site";
import type { AppLocale } from "@/i18n/routing";

export async function Footer() {
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Nav");
  const locale = (await getLocale()) as AppLocale;
  const links = [
    ["/about", nav("about")],
    ["/pricing", nav("pricing")],
    ["/contact", nav("contact")],
  ] as const;

  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.35fr_0.8fr_1fr]">
        <div>
          <p className="font-brand text-3xl tracking-[0.08em]">海那边</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-paper/65">{t("tagline")}</p>
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-[0.18em] text-paper/50 uppercase">
            {t("navigate")}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {links.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-paper/75 hover:text-paper">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-[0.18em] text-paper/50 uppercase">
            {t("contact")}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-paper/70">
            <li>{siteContent.email[locale]}</li>
            <li>{siteContent.phone[locale]}</li>
            <li>{siteContent.location[locale]}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="shell flex flex-col gap-2 py-5 text-xs text-paper/50 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-brand text-sm text-paper/70">海那边</span>
            {t("rightsSuffix")}
          </p>
          <p>{t("note")}</p>
        </div>
      </div>
    </footer>
  );
}
