import { roleClarification } from "@/content/homepage";

/**
 * RoleClarification — a SOT 2. szakaszának „Egyértelmű szerepek” része.
 * A JG, a K&H Értékpapír / Patria Fióktelep és az ügyfél szerepe vizuálisan is
 * elkülönül: három önálló, egyenrangú kártya, összemosás nélkül.
 */
export default function RoleClarification() {
  return (
    <section
      id="szereptisztazas"
      aria-labelledby="szereptisztazas-cim"
      className="bg-graphite"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-xs font-bold tracking-widest text-silver uppercase">
          {roleClarification.sectionLabel}
        </p>
        <h2
          id="szereptisztazas-cim"
          className="mt-3 text-2xl font-semibold tracking-tight text-paper sm:text-3xl"
        >
          {roleClarification.heading}
        </h2>

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {roleClarification.roles.map((role) => (
            <li
              key={role.actor}
              className="rounded-card border border-white/15 bg-white/5 p-5"
            >
              <h3 className="text-base font-semibold text-paper">{role.actor}</h3>
              <p className="mt-2 text-base leading-relaxed text-silver">
                {role.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
