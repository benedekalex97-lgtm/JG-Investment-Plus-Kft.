import Link from "next/link";
import { footer, meta } from "@/content/homepage";

/**
 * Footer — a SOT 10. szakaszának kötelező rövid változata, teljes szöveggel.
 * Nem jelenik meg K&H- vagy Patria-logó; a wordmark egyszerű szöveg.
 *
 * v0.2 anyagvilág: Carbon alap, Porcelain/Cool Silver tipográfia, egyetlen
 * nagyon visszafogott Aubergine jelzővonal a wordmark alatt — signature
 * érintés, nem dekoráció. A .on-dark osztály a fókuszgyűrűt Porcelainre
 * váltja (ld. globals.css), mert az Aubergine kontrasztja Carbonon 1.57:1,
 * ami sötét alapon nem elég szöveghez/fókuszhoz.
 */
export default function Footer() {
  return (
    <footer className="on-dark bg-carbon">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div>
          <Link
            href="/#top"
            className="inline-flex min-h-11 items-center rounded font-display text-lg text-porcelain"
          >
            {meta.wordmark}
          </Link>
          <span
            aria-hidden="true"
            className="mt-2 block h-0.5 w-8 rounded-full bg-aubergine"
          />
        </div>

        <div className="mt-6 max-w-4xl space-y-4">
          <p className="text-base leading-relaxed font-medium text-porcelain">
            {footer.statusLine}
          </p>
          <p className="text-base leading-relaxed text-cool-silver">
            {footer.brandLine}
          </p>
          <p className="text-base leading-relaxed text-cool-silver">
            {footer.disclaimerLine}
          </p>
        </div>

        <nav aria-label="Lábléc" className="mt-8 border-t border-white/10 pt-6">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {footer.links.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a
                    href={link.href}
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="inline-flex min-h-11 items-center text-base font-medium text-porcelain underline underline-offset-4"
                  >
                    {link.label}
                  </a>
                ) : (
                  /*
                    Célhivatkozás nélküli lábléc-tétel esetén (pl. jövőbeli,
                    élesítés előtt pótlandó jogi dokumentum) a prototípus ezt
                    láthatóan jelzi, saját megfogalmazású szöveggel nem pótolva.
                  */
                  <span className="inline-flex min-h-11 items-center text-base text-cool-silver">
                    {link.label}
                    <span className="ml-2 rounded border border-white/20 px-1.5 py-0.5 text-xs font-medium text-cool-silver">
                      élesítés előtt pótlandó
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-sm text-cool-silver">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
