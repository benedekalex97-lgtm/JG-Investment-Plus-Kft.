import { useId } from "react";

import { MARK } from "./geometry";

/**
 * Statikus, összeállt embléma — a WebGL-színpad tartaléka.
 *
 * Akkor jelenik meg, ha a WebGL nem érhető el, a kontextus elvész, a modul
 * betöltése meghiúsul, vagy nincs JavaScript. Ugyanabból a három
 * mester-subpathból épül, mint a 3D jelenet, tehát a sziluett és a rések
 * azonosak. Az anyaghatást kizárólag token-alapú színátmenetek adják (nincs
 * nyers HEX); a porcelán fedőlap egy vékony BELSŐ kontúrt kap (clipPath),
 * hogy ne olvadjon bele a Porcelain háttérbe — a külső kontúr így sem nő.
 * Dekoratív: aria-hidden.
 */
export default function EmblemFallback({ className = "" }: { className?: string }) {
  const id = `jg-fb-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { cap, left, right } = MARK.pieces;
  const { x, y, width, height } = MARK.viewBox;

  return (
    <svg
      viewBox={`${x} ${y} ${width} ${height}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-cap`} x1="0.1" y1="0" x2="0.9" y2="1">
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
        <clipPath id={`${id}-cap-clip`}>
          <path d={cap.d} />
        </clipPath>
      </defs>
      <path d={cap.d} fill={`url(#${id}-cap)`} />
      <path
        d={cap.d}
        fill="none"
        clipPath={`url(#${id}-cap-clip)`}
        strokeWidth="1"
        style={{ stroke: "color-mix(in srgb, var(--color-cool-silver) 70%, transparent)" }}
      />
      <path d={left.d} fill={`url(#${id}-silver)`} />
      <path d={right.d} fill={`url(#${id}-glass)`} />
    </svg>
  );
}
