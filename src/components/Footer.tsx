import { footer, meta } from "@/content/homepage";

/**
 * Footer — a SOT 10. szakaszának kötelező rövid változata, teljes szöveggel.
 * Nem jelenik meg K&H- vagy Patria-logó; a wordmark egyszerű szöveg.
 */
export default function Footer() {
  return (
    <footer className="bg-graphite">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-6 w-1.5 rounded-full bg-azure"
          />
          <span className="text-lg font-semibold tracking-tight text-paper">
            {meta.wordmark}
          </span>
        </div>

        <div className="mt-6 max-w-4xl space-y-4">
          <p className="text-base leading-relaxed font-medium text-paper">
            {footer.statusLine}
          </p>
          <p className="text-base leading-relaxed text-silver">
            {footer.brandLine}
          </p>
          <p className="text-base leading-relaxed text-silver">
            {footer.disclaimerLine}
          </p>
        </div>

        <nav aria-label="Lábléc" className="mt-8 border-t border-white/15 pt-6">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {footer.links.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a
                    href={link.href}
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="inline-flex min-h-11 items-center text-base font-medium text-paper underline underline-offset-4"
                  >
                    {link.label}
                  </a>
                ) : (
                  /*
                    Az adatkezelési tájékoztatóhoz a K&H/Patria által átadott
                    teljes szöveg szükséges. Saját megfogalmazású jogi szöveggel
                    nem pótoljuk, ezért itt nincs célhivatkozás, és ezt a
                    prototípus láthatóan jelzi.
                  */
                  <span className="inline-flex min-h-11 items-center text-base text-silver">
                    {link.label}
                    <span className="ml-2 rounded border border-white/30 px-1.5 py-0.5 text-xs font-semibold text-silver">
                      élesítés előtt pótlandó
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 border-t border-white/15 pt-6">
          <p className="text-sm text-silver">{footer.copyright}</p>
          <p className="mt-2 text-sm text-silver">{meta.prototypeStatus}</p>
        </div>
      </div>
    </footer>
  );
}
