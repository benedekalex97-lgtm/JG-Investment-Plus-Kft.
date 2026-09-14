import Section from "./Section";
import { contact } from "@/content/homepage";

/**
 * Contact — a SOT 5. szakasza: elérhetőségek, ügynöki üzleti órák és a K&H
 * Értékpapír ügyfélszolgálata.
 *
 * Korábban itt egy inaktív (backend, API route, adatmentés nélküli)
 * kapcsolati űrlap-prototípus is szerepelt; ez eltávolításra került, mert
 * aktívnak látszó, de valójában semmit nem küldő UI-t hagyott a felületen.
 * Adatküldés, API-route, adatbázis vagy e-mail-küldés jelen javítás
 * keretében sem került implementálásra.
 */
export default function Contact() {
  return (
    <Section
      id="kapcsolat"
      label={contact.sectionLabel}
      heading={contact.heading}
      headingId="kapcsolat-cim"
      lead={contact.lead}
      tone="surface"
    >
      <div className="max-w-2xl space-y-6">
        <ul className="rounded-card border border-border bg-canvas p-6">
          {contact.details.map((detail) => (
            <li
              key={detail.label}
              className="flex flex-col gap-0.5 border-b border-border py-3 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <span className="text-sm font-medium text-text-secondary sm:w-40 sm:shrink-0">
                {detail.label}
              </span>
              {detail.href ? (
                <a
                  href={detail.href}
                  className="inline-flex min-h-11 items-center text-base font-medium text-accent underline underline-offset-4 sm:min-h-0"
                >
                  {detail.value}
                </a>
              ) : (
                <span className="text-base text-text-primary">
                  {detail.value}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="rounded-card border border-border bg-canvas p-6">
          <h3 className="text-lg font-medium text-text-primary">
            {contact.businessHours.heading}
          </h3>
          <dl className="mt-4 space-y-3">
            {contact.businessHours.items.map((item) => (
              <div key={item.market}>
                <dt className="text-sm font-medium text-text-secondary">
                  {item.market}
                </dt>
                <dd className="text-base leading-relaxed text-text-primary">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* A K&H Értékpapír önálló, vizuálisan elkülönített doboza. */}
        <div className="rounded-card border border-border border-l-[3px] border-l-ink bg-canvas p-6">
          <h3 className="text-lg font-medium text-text-primary">
            {contact.khSupport.heading}
          </h3>
          <ul className="mt-4 space-y-2">
            {contact.khSupport.items.map((item) => (
              <li
                key={item.label}
                className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <span className="text-sm font-medium text-text-secondary sm:w-40 sm:shrink-0">
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
        </div>

        <p className="border-t border-border-strong pt-5 text-base leading-relaxed font-medium text-text-primary">
          {contact.orderNotice}
        </p>
      </div>
    </Section>
  );
}
