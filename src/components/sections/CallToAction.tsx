import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/Button";

export async function CallToAction({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const common = await getTranslations("Common");
  return (
    <section className="section">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-paper sm:px-12 lg:px-16 lg:py-16">
          <div className="absolute -top-28 right-0 h-72 w-72 rounded-full border border-paper/10" />
          <div className="absolute right-24 -bottom-20 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl leading-tight font-semibold sm:text-4xl">{title}</h2>
            <p className="mt-5 max-w-xl text-paper/65">{text}</p>
            <Link
              href="/book"
              className={buttonClasses(
                "secondary",
                "mt-7 border-paper/30 text-paper hover:border-paper hover:text-paper",
              )}
            >
              {common("book")} <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
