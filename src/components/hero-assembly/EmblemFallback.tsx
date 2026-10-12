import { useId } from "react";

import { ASSEMBLY } from "./config";
import { MARK, PIECE_KEYS } from "./geometry";

/**
 * Statikus, összeállt embléma — a WebGL-színpad tartaléka.
 *
 * Akkor jelenik meg, ha a WebGL nem érhető el, a kontextus elvész, a modul
 * betöltése meghiúsul, vagy nincs JavaScript. Ugyanabból a három
 * mester-subpathból épül, mint a 3D jelenet, és ugyanazt az anyagkiosztást
 * követi (config.ts, pieceMaterials), tehát a sziluett, a rések és a színek
 * a 3D változattal egyeznek. Az anyaghatást kizárólag token-alapú
 * színátmenetek adják (nincs nyers HEX); a porcelán elem egy vékony BELSŐ
 * kontúrt kap (clipPath), hogy ne olvadjon bele a Porcelain háttérbe — a
 * külső kontúr így sem nő. Dekoratív: aria-hidden.
 */
export default function EmblemFallback({ className = "" }: { className?: string }) {
  const id = `jg-fb-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { x, y, width, height } = MARK.viewBox;

  return (
    <svg
      viewBox={`${x} ${y} ${width} ${height}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-porcelain`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-surface)" }} />
          <stop
            offset="1"
            style={{
              stopColor: "color-mix(in srgb, var(--color-porcelain) 80%, var(--color-cool-silver))",
            }}
          />
        </linearGradient>
        <linearGradient id={`${id}-silver`} x1="0" y1="0" x2="0.4" y2="1">
          <stop
            offset="0"
            style={{ stopColor: "color-mix(in srgb, var(--color-cool-silver) 40%, var(--color-surface))" }}
          />
          <stop offset="0.55" style={{ stopColor: "var(--color-cool-silver)" }} />
          <stop
            offset="1"
            style={{ stopColor: "color-mix(in srgb, var(--color-cool-silver) 76%, var(--color-ink))" }}
          />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0.85" y1="0.05" x2="0.1" y2="0.95">
          <stop offset="0" style={{ stopColor: "var(--color-aubergine)" }} />
          <stop
            offset="0.45"
            style={{ stopColor: "color-mix(in srgb, var(--color-aubergine) 85%, var(--color-muted-plum))" }}
          />
          <stop
            offset="1"
            style={{ stopColor: "color-mix(in srgb, var(--color-aubergine) 25%, var(--color-muted-plum))" }}
          />
        </linearGradient>
        {PIECE_KEYS.filter((key) => ASSEMBLY.pieceMaterials[key] === "porcelain").map((key) => (
          <clipPath key={key} id={`${id}-clip-${key}`}>
            <path d={MARK.pieces[key].d} />
          </clipPath>
        ))}
      </defs>
      {PIECE_KEYS.map((key) => {
        const kind = ASSEMBLY.pieceMaterials[key];
        const d = MARK.pieces[key].d;
        return (
          <g key={key}>
            <path d={d} fill={`url(#${id}-${kind})`} />
            {kind === "porcelain" ? (
              <path
                d={d}
                fill="none"
                clipPath={`url(#${id}-clip-${key})`}
                strokeWidth="1"
                style={{ stroke: "color-mix(in srgb, var(--color-cool-silver) 70%, transparent)" }}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
