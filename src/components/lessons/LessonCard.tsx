import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Lesson, Locale } from "@/types/content";

export async function LessonCard({
  lesson,
  locale,
}: {
  lesson: Lesson;
  locale: Locale;
}) {
  const t = await getTranslations("Lessons");

  return (
    <article className="group flex h-full flex-col rounded-[1.5rem] border border-line bg-white-soft p-6 transition duration-200 hover:-translate-y-1 hover:shadow-soft">
      <p className="text-xs font-bold tracking-[0.16em] text-accent uppercase">
        {lesson.audience[locale]}
      </p>
      <h2 className="mt-3 font-display text-2xl leading-snug font-semibold">
        {lesson.title[locale]}
      </h2>
      {locale === "zh" ? (
        <p className="mt-1 text-sm text-ink-soft">{lesson.title.en}</p>
      ) : null}
      <p className="mt-5 flex-1 text-sm leading-7 text-ink-soft">
        {lesson.description[locale]}
      </p>
      <div className="mt-6 space-y-2 border-t border-line pt-5 text-sm text-ink-soft">
        <p className="flex items-start gap-2">
          <Clock3 className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
          <span><strong className="font-medium text-ink">{t("duration")}:</strong> {lesson.duration[locale]}</span>
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
          <span><strong className="font-medium text-ink">{t("format")}:</strong> {lesson.format[locale]}</span>
        </p>
      </div>
      <ul className="mt-5 flex flex-wrap gap-2" aria-label={t("suitable")}>
        {lesson.tags[locale].map((tag) => (
          <li key={tag} className="rounded-full bg-paper-deep px-3 py-1 text-xs text-ink-soft">
            {tag}
          </li>
        ))}
      </ul>
      <Link
        href="/book"
        className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-dark"
      >
        {t("book")}
        <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </article>
  );
}
