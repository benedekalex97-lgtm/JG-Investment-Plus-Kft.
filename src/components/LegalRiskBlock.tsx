import { imprint, legal, privacyPending } from "@/content/homepage";

/**
 * LegalRiskBlock — a SOT 6., 7., 8. és 9. szakasza.
 *
 * A jogi és kockázati tartalom végig nyitva, teljes szöveggel jelenik meg:
 * nincs accordion, tooltip vagy modal, és nincs elrejtő vezérlő. A betűméret
 * nem kisebb a többi szakasz törzsszövegénél, a kontraszt WCAG AAA szinten
 * marad (ink Porcelainen/fehéren, ld. globals.css kontraszt-jegyzet).
 *
 * v0.2: a vizuális DOMINANCIA csökkent (nincs teljes szélességű sötét blokk,
 * nagyobb a fehértér, letisztultabb a tipográfiai tagolás, kevesebb az
 * egyforma bekeretezett doboz egymás alatt), de a jogi TARTALOM — minden
 * cím, bekezdés, felsorolási pont és sorrend — szó szerint változatlan.
 * A strukturált, ellenőrzést igénylő blokkok (kockázati figyelmeztetés,
 * tevékenységi korlátok, panaszkezelés, adatvédelmi feltétel, impresszum)
 * kártyaként emelkednek ki; a folyamatosan olvasandó, elbeszélő szövegek
 * (közvetítői státusz, tevékenység terjedelme, jogi nyilatkozat) egyszerű
 * felső osztóvonallal tagolódnak — ez a váltakozás maga a hierarchia, nem
 * a szöveg rövidítése.
 */
export default function LegalRiskBlock() {
  return (
    <section
      id="jogi-tajekoztato"
      aria-labelledby="jogi-tajekoztato-cim"
      className="bg-canvas"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
          {legal.sectionLabel}
        </p>
        <h2
          id="jogi-tajekoztato-cim"
          className="font-display mt-3 text-[1.75rem] leading-[1.2] text-text-primary sm:text-[2.25rem]"
        >
          {legal.heading}
        </h2>

        {/* KOCKÁZATI FIGYELMEZTETÉS — elöl, kiemelten, mindig láthatóan. */}
        <div className="mt-10 rounded-card border border-border border-l-[3px] border-l-accent bg-surface p-6 shadow-soft sm:mt-12">
          <h3 className="text-sm font-semibold tracking-wide text-accent uppercase">
            {legal.riskWarning.heading}
          </h3>
          <p className="mt-3 text-base leading-relaxed font-medium text-text-primary sm:text-[1.0625rem]">
            {legal.riskWarning.body}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="border-t border-border-strong pt-5">
            <h3 className="text-lg font-medium text-text-primary">
              {legal.status.heading}
            </h3>
            <div className="mt-3 space-y-3">
              {legal.status.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-base leading-relaxed text-text-primary"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="border-t border-border-strong pt-5">
            <h3 className="text-lg font-medium text-text-primary">
              {legal.scope.heading}
            </h3>
            <div className="mt-3 space-y-3">
              {legal.scope.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-base leading-relaxed text-text-primary"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-card border border-border bg-surface p-6 shadow-soft">
          <h3 className="text-lg font-medium text-text-primary">
            {legal.limits.heading}
          </h3>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {legal.limits.items.map((item) => (
              <li
                key={item.slice(0, 40)}
                className="flex gap-3 text-base leading-relaxed text-text-primary"
              >
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 border-t border-border-strong pt-5">
          <h3 className="text-lg font-medium text-text-primary">
            {legal.disclaimer.heading}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-text-primary">
            {legal.disclaimer.body}
          </p>
        </div>

        {/* SOT 7. Panaszkezelés és jogorvoslat */}
        <div
          id="panaszkezeles"
          className="mt-10 scroll-mt-24 rounded-card border border-border bg-surface p-6 shadow-soft"
        >
          <h3 className="text-lg font-medium text-text-primary">
            {legal.complaints.heading}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-text-primary">
            {legal.complaints.lead}
          </p>
          <ul className="mt-4 space-y-2">
            {legal.complaints.items.map((item) => (
              <li
                key={item.label}
                className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <span className="text-sm font-medium text-text-secondary sm:w-56 sm:shrink-0">
                  {item.label}
                </span>
                {item.href ? (
                  <a
                    href={item.href}
                    className="inline-flex min-h-11 items-center break-all text-base font-medium text-accent underline underline-offset-4 sm:min-h-0"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span className="text-base text-text-primary">
                    {item.value}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-base leading-relaxed text-text-primary">
            {legal.complaints.closing}
          </p>
        </div>

        {/* SOT 8. Adatvédelem — élesítés előtti feltétel, láthatóan jelezve. */}
        <div className="mt-10 rounded-card border border-border border-l-[3px] border-l-accent bg-surface p-6 shadow-soft">
          <h3 className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
            {privacyPending.label}
          </h3>
          <p className="mt-2 text-base leading-relaxed font-medium text-text-primary">
            {privacyPending.body}
          </p>
        </div>

        {/* SOT 9. Impresszum */}
        <div
          id="impresszum"
          className="mt-10 scroll-mt-24 rounded-card border border-border bg-surface p-6 shadow-soft"
        >
          <h3 className="text-lg font-medium text-text-primary">
            {imprint.heading}
          </h3>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            {imprint.items.map((item) => (
              <div key={item.label}>
                <dt className="text-sm font-medium text-text-secondary">
                  {item.label}
                </dt>
                <dd className="text-base leading-relaxed text-text-primary">
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
