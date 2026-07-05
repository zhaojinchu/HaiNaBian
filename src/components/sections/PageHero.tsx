export function PageHero({
  eyebrow,
  title,
  intro,
  secondary,
}: {
  eyebrow: React.ReactNode;
  title: string;
  intro: string;
  secondary?: string;
}) {
  return (
    <section className="border-b border-line bg-white-soft/45">
      <div className="shell py-16 sm:py-20 lg:py-24">
        <p className="text-xs font-bold tracking-[0.22em] text-accent uppercase">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {secondary ? <p className="mt-3 text-lg text-accent">{secondary}</p> : null}
        <p className="mt-6 max-w-2xl text-base leading-8 text-ink-soft sm:text-lg">{intro}</p>
      </div>
    </section>
  );
}
