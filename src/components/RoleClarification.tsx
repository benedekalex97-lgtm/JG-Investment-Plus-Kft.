import { roleClarification } from "@/content/homepage";

/**
 * RoleClarification — a SOT 2. szakaszának „Egyértelmű szerepek” része.
 *
 * v0.2: a v0.1 nehéz, teljes szélességű Deep Graphite blokkja helyett
 * világos, levegős, egységes háromkártyás elrendezés. A JG, a K&H
 * Értékpapír / Patria Fióktelep és az ügyfél szerepe vizuálisan is
 * elkülönül — nem színkódolással (ami versengő/hierarchikus érzetet
 * keltene), hanem egyenrangú kártyahatárokkal és egy-egy finom Aubergine
 * felső jelzővonallal, ami a márka signature színét adagoltan viszi be
 * anélkül, hogy az oldal „lilává” válna.
 */
export default function RoleClarification() {
  return (
    <section
      id="szereptisztazas"
      aria-labelledby="szereptisztazas-cim"
      className="bg-canvas"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <p className="text-xs font-medium tracking-[0.16em] text-accent uppercase">
          {roleClarification.sectionLabel}
        </p>
        <h2
          id="szereptisztazas-cim"
          className="font-display mt-3 max-w-2xl text-[1.75rem] leading-[1.2] text-balance text-text-primary sm:text-[2.25rem]"
        >
          {roleClarification.heading}
        </h2>

        <ul className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3">
          {roleClarification.roles.map((role) => (
            <li
              key={role.actor}
              className="rounded-card border border-border border-t-[3px] border-t-accent bg-surface p-6 shadow-soft"
            >
              <h3 className="text-base font-medium text-text-primary">
                {role.actor}
              </h3>
              <p className="mt-2.5 text-base leading-relaxed text-text-secondary">
                {role.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
