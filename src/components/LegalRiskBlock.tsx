import { imprint, legal, privacyPending } from "@/content/homepage";

/**
 * LegalRiskBlock — a SOT 6., 7., 8. és 9. szakasza.
 *
 * A jogi és kockázati tartalom végig nyitva, teljes szöveggel jelenik meg:
 * nincs accordion, tooltip vagy modal, és nincs elrejtő vezérlő. A betűméret
 * nem kisebb a többi szakasz törzsszövegénél, a kontraszt pedig WCAG AA felett
 * marad (fehér a Deep Graphite-on, illetve Deep Graphite az Ice Canvason).
 */
export default function LegalRiskBlock() {
  return (
    <section
      id="jogi-tajekoztato"
      aria-labelledby="jogi-tajekoztato-cim"
      className="bg-ice"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <p className="text-xs font-bold tracking-widest text-action uppercase">
          {legal.sectionLabel}
        </p>
        <h2
          id="jogi-tajekoztato-cim"
          className="mt-3 text-2xl font-semibold tracking-tight text-graphite sm:text-3xl"
        >
          {legal.heading}
        </h2>

        {/* KOCKÁZATI FIGYELMEZTETÉS — elöl, kiemelten, mindig láthatóan. */}
        <div className="mt-8 rounded-card border-2 border-graphite bg-graphite p-6">
          <h3 className="text-base font-bold tracking-wide text-silver uppercase">
            {legal.riskWarning.heading}
          </h3>
          <p className="mt-3 text-base leading-relaxed font-medium text-paper sm:text-[1.0625rem]">
            {legal.riskWarning.body}
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-card border border-silver bg-paper p-6">
            <h3 className="text-lg font-semibold text-graphite">
              {legal.status.heading}
            </h3>
            <div className="mt-3 space-y-3">
              {legal.status.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-base leading-relaxed text-graphite"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-silver bg-paper p-6">
            <h3 className="text-lg font-semibold text-graphite">
              {legal.scope.heading}
            </h3>
            <div className="mt-3 space-y-3">
              {legal.scope.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-base leading-relaxed text-graphite"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-card border border-silver bg-paper p-6">
          <h3 className="text-lg font-semibold text-graphite">
            {legal.limits.heading}
          </h3>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {legal.limits.items.map((item) => (
              <li
                key={item.slice(0, 40)}
                className="flex gap-3 text-base leading-relaxed text-graphite"
              >
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-action"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-card border border-silver bg-paper p-6">
          <h3 className="text-lg font-semibold text-graphite">
            {legal.disclaimer.heading}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-graphite">
            {legal.disclaimer.body}
          </p>
        </div>

        {/* SOT 7. Panaszkezelés és jogorvoslat */}
        <div
          id="panaszkezeles"
          className="mt-6 scroll-mt-24 rounded-card border border-silver bg-paper p-6"
        >
          <h3 className="text-lg font-semibold text-graphite">
            {legal.complaints.heading}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-graphite">
            {legal.complaints.lead}
          </p>
          <ul className="mt-4 space-y-2">
            {legal.complaints.items.map((item) => (
              <li
                key={item.label}
                className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <span className="text-sm font-semibold text-steel sm:w-56 sm:shrink-0">
                  {item.label}
                </span>
                {item.href ? (
                  <a
                    href={item.href}
                    className="inline-flex min-h-11 items-center break-all text-base font-medium text-action underline underline-offset-4 sm:min-h-0"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span className="text-base text-graphite">{item.value}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-base leading-relaxed text-graphite">
            {legal.complaints.closing}
          </p>
        </div>

        {/* SOT 8. Adatvédelem — élesítés előtti feltétel, láthatóan jelezve. */}
        <div className="mt-6 rounded-card border-l-4 border-action border-y border-r border-y-silver border-r-silver bg-paper p-6">
          <h3 className="text-xs font-bold tracking-widest text-action uppercase">
            {privacyPending.label}
          </h3>
          <p className="mt-2 text-base leading-relaxed font-medium text-graphite">
            {privacyPending.body}
          </p>
        </div>

        {/* SOT 9. Impresszum */}
        <div
          id="impresszum"
          className="mt-6 scroll-mt-24 rounded-card border border-silver bg-paper p-6"
        >
          <h3 className="text-lg font-semibold text-graphite">
            {imprint.heading}
          </h3>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            {imprint.items.map((item) => (
              <div key={item.label}>
                <dt className="text-sm font-semibold text-steel">
                  {item.label}
                </dt>
                <dd className="text-base leading-relaxed text-graphite">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
