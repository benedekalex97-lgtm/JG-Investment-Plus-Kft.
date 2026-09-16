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
    <footer className="on-dark border-t border-white/12 bg-surface-deep">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        {/*
          Kétoszlopos hierarchia: balra a márka és a státusz, jobbra a
          hosszabb jogi szöveg. Mobilon egymás alatt, logikus sorrendben.
        */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Link
              href="/#top"
              className="inline-flex min-h-11 items-center rounded font-display text-xl text-porcelain"
            >
              {meta.wordmark}
            </Link>
            <span
              aria-hidden="true"
              className="mt-3 block h-0.5 w-10 rounded-full bg-signal-berry-light"
            />
            <p className="mt-6 max-w-[42ch] text-[0.9375rem] leading-relaxed font-medium text-porcelain">
              {footer.statusLine}
            </p>
          </div>

          <div className="space-y-4 lg:col-span-8">
            <p className="max-w-[80ch] text-[0.9375rem] leading-relaxed text-cool-silver">
              {footer.brandLine}
            </p>
            <p className="max-w-[80ch] text-sm leading-relaxed text-cool-silver">
              {footer.disclaimerLine}
            </p>
          </div>
        </div>

        <nav aria-label="Lábléc" className="mt-12 border-t border-white/12 pt-7">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-1">
            {footer.links.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a
                    href={link.href}
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="inline-flex min-h-11 items-center text-[0.9375rem] font-medium text-porcelain underline decoration-white/30 underline-offset-4 transition-colors hover:text-signal-berry-light hover:decoration-signal-berry-light"
                  >
                    {link.label}
                  </a>
                ) : (
                  /*
                    Célhivatkozás nélküli lábléc-tétel esetén (pl. jövőbeli,
                    élesítés előtt pótlandó jogi dokumentum) a prototípus ezt
                    láthatóan jelzi, saját megfogalmazású szöveggel nem pótolva.
                  */
                  <span className="inline-flex min-h-11 items-center text-[0.9375rem] text-cool-silver">
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

        <div className="mt-10 border-t border-white/12 pt-7">
          <p className="text-sm text-cool-silver">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
