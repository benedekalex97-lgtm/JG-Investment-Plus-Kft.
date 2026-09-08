import Section from "./Section";
import { contact, contactForm } from "@/content/homepage";

/**
 * Contact — a SOT 5. szakasza: elérhetőségek, ügynöki üzleti órák, a K&H
 * Értékpapír ügyfélszolgálata és a kapcsolati űrlap vizuális prototípusa.
 *
 * AZ ŰRLAP EBBEN A FÁZISBAN NEM AKTÍV.
 * Szándékosan nincs <form> elem: így strukturálisan sem indítható beküldés —
 * nincs backend, API route, adatmentés, e-mail-továbbítás, analitika, külső
 * űrlapszolgáltatás és hamis sikeres beküldési állapot sem. A gomb type="button",
 * és nem továbbít adatot. Az adatkezelési tájékoztató hiányát nem pótoljuk saját
 * készítésű jogi szöveggel; a jelölőnégyzet felirata a SOT szövege.
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
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Elérhetőségek és üzleti órák */}
        <div className="space-y-6">
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
        </div>

        {/* Kapcsolati űrlap — vizuális prototípus */}
        <div className="rounded-card border border-border bg-canvas p-6 shadow-soft">
          <h3 className="text-lg font-medium text-text-primary">
            {contactForm.heading}
          </h3>

          {/* A prototípus státusza láthatóan jelezve, nem csak kommentben. */}
          <p
            role="note"
            className="mt-3 rounded-lg border border-border border-l-[3px] border-l-accent bg-surface p-4 text-base leading-relaxed font-medium text-text-primary"
          >
            {contactForm.prototypeNotice}
          </p>

          <div role="group" aria-label={contactForm.heading} className="mt-5 space-y-4">
            {contactForm.fields.map((field) =>
              field.type === "textarea" ? (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-text-primary"
                  >
                    {field.label}
                  </label>
                  <textarea
                    id={field.id}
                    name={field.id}
                    rows={4}
                    autoComplete={field.autoComplete}
                    className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-text-primary"
                  />
                </div>
              ) : (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-text-primary"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    className="mt-1.5 h-12 w-full rounded-lg border border-border bg-surface px-3 text-base text-text-primary"
                  />
                </div>
              ),
            )}

            {/* A jelölőnégyzet és a hozzá tartozó, kattintható felirat együtt jóval
                44 px fölötti érintési célt ad. */}
            <div className="flex items-start gap-3 py-2">
              <input
                id="adatkezeles"
                name="adatkezeles"
                type="checkbox"
                className="mt-0.5 h-6 w-6 shrink-0 rounded border-border accent-[var(--accent)]"
              />
              <label
                htmlFor="adatkezeles"
                className="text-base leading-relaxed text-text-primary"
              >
                {contactForm.consentLabel}
              </label>
            </div>

            {/*
              type="button": nem indít beküldést, és nincs mögötte kezelő.
              Nem jelenít meg sikeres beküldési állapotot.
            */}
            <button
              type="button"
              className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 text-base font-medium text-white transition-colors hover:bg-accent-hover sm:w-auto"
            >
              {contactForm.submitLabel}
            </button>
          </div>

          <p className="mt-5 border-t border-border pt-4 text-base leading-relaxed font-medium text-text-primary">
            {contactForm.orderNotice}
          </p>
        </div>
      </div>
    </Section>
  );
}
