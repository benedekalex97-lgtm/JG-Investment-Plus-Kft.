"use client";

import { useId, useState, type ReactNode } from "react";

export type LegalPanel = {
  readonly id: string;
  readonly heading: string;
  readonly content: ReactNode;
};

/**
 * LegalAccordion — a részletes Jogi tájékoztató összecsukható témakörei.
 *
 * AKADÁLYMENTESSÉG ÉS SEO — a lényeg:
 *   – valódi <button> vezérlő, tehát Tab/Enter/Space natívan működik;
 *   – aria-expanded a gombon, aria-controls a panelre, és a panel
 *     aria-labelledby-vel mutat vissza a gombra;
 *   – a panel TARTALMA MINDIG A DOM-BAN VAN. Összecsukott állapotban csak a
 *     `hidden` attribútum kerül rá — nem unmountolódik, nem lazy-loadolódik.
 *     Így a szerveroldalon renderelt HTML a teljes jogi szöveget tartalmazza,
 *     a keresőmotorok és a szövegkeresés számára is elérhetően;
 *   – a kockázati figyelmeztetés NEM ebben a komponensben él: az accordionon
 *     kívül, alapállapotban láthatóan jelenik meg.
 *
 * A szakaszok alapállapotban összecsukva jelennek meg, hogy a jogi tartalom ne
 * uralja az oldal vizuális hierarchiáját — de semmi nincs elrejtve vagy
 * olvashatatlanná téve.
 */
export default function LegalAccordion({ panels }: { panels: readonly LegalPanel[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const baseId = useId();

  return (
    <div className="border-t border-border">
      {panels.map((panel) => {
        const isOpen = openId === panel.id;
        const buttonId = `${baseId}-${panel.id}-gomb`;
        const panelId = `${baseId}-${panel.id}-panel`;

        return (
          <div key={panel.id} className="border-b border-border">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : panel.id)}
                className="flex min-h-13 w-full items-center justify-between gap-4 py-4 text-left text-base font-medium text-text-primary transition-colors hover:text-accent sm:text-lg"
              >
                <span>{panel.heading}</span>
                <span
                  aria-hidden="true"
                  className={`shrink-0 text-signal-berry transition-transform duration-200 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-6"
            >
              {panel.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
