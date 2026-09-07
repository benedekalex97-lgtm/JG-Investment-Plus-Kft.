/**
 * HeroMotion — a Hero könnyű, CSS/SVG-alapú mozgó kompozíciója.
 *
 * Tudatos korlátok:
 *  - nincs WebGL, Three.js, Canvas vagy animációs framework; inline SVG +
 *    CSS keyframes, kizárólag transform és opacity;
 *  - a figura arctalan, neutrális, nem realisztikus, nem öltönyös sziluett;
 *  - a gyertyák absztrakt, semleges grafit-, acél- és ezüstszürke formák:
 *    nincs piros–zöld kód, chartvonal, tengely, ár, szám, százalék vagy ticker;
 *  - a mozgás nem alkot folyamatosan emelkedő pályát, és nincs benne célvonal
 *    vagy győzelmi pillanat: minden ciklus visszatér a kiindulási állapotba;
 *  - a teljes SVG dekoratív (aria-hidden), így nem terheli a képernyőolvasót.
 *
 * A mozgásvezérlés teljes egészében a globals.css @media
 * (prefers-reduced-motion: reduce) blokkjában kikapcsolható; JavaScript nem
 * vesz részt sem a láthatóságban, sem az animációban.
 */

/** Absztrakt gyertyaforma: lekerekített test, finom kanóc, semleges tónus. */
type CandleProps = {
  x: number;
  bodyY: number;
  bodyHeight: number;
  wickTop: number;
  wickBottom: number;
  fill: string;
  motionClass: string;
  delay: string;
  opacity: number;
};

const CANDLE_WIDTH = 26;

function Candle({
  x,
  bodyY,
  bodyHeight,
  wickTop,
  wickBottom,
  fill,
  motionClass,
  delay,
  opacity,
}: CandleProps) {
  return (
    <g className={motionClass} style={{ animationDelay: delay }} opacity={opacity}>
      {/* Kanóc — semleges, vékony függőleges tag. */}
      <rect
        x={x + CANDLE_WIDTH / 2 - 1.5}
        y={wickTop}
        width={3}
        height={wickBottom - wickTop}
        rx={1.5}
        fill={fill}
        opacity={0.55}
      />
      {/* Test — lekerekített, enyhe 2.5D-érzetű kitöltéssel. */}
      <rect
        x={x}
        y={bodyY}
        width={CANDLE_WIDTH}
        height={bodyHeight}
        rx={9}
        fill={fill}
      />
      {/* Finom felső fénypánt: visszafogott térbeliség, nem hologram. */}
      <rect
        x={x + 4}
        y={bodyY + 5}
        width={CANDLE_WIDTH - 8}
        height={Math.max(6, bodyHeight * 0.22)}
        rx={5}
        fill="#FFFFFF"
        opacity={0.16}
      />
    </g>
  );
}

export default function HeroMotion() {
  return (
    <div className="relative w-full select-none" aria-hidden="true">
      <svg
        viewBox="0 0 640 460"
        role="presentation"
        focusable="false"
        className="block h-auto w-full"
        /* A rögzített viewBox és arány miatt nincs layout shift. */
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Frosted-glass / satin anyagérzet a figurához. */}
          <linearGradient id="jgFigureFill" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor="#2F80ED" stopOpacity="0.78" />
            <stop offset="55%" stopColor="#2F80ED" stopOpacity="0.70" />
            <stop offset="100%" stopColor="#256FD1" stopOpacity="0.66" />
          </linearGradient>

          {/* Finom kontúrfény a sziluett peremén. */}
          <linearGradient id="jgFigureRim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.35" />
          </linearGradient>

          {/* Halk háttérfény — dekoratív, nem hangsúlyos. */}
          <radialGradient id="jgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2F80ED" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#2F80ED" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="jgGroundFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#B7C2CA" stopOpacity="0" />
            <stop offset="22%" stopColor="#B7C2CA" stopOpacity="0.75" />
            <stop offset="78%" stopColor="#B7C2CA" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#B7C2CA" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Háttérfény */}
        <ellipse cx="330" cy="230" rx="250" ry="185" fill="url(#jgGlow)" />

        {/* Távoli gyertyaréteg — lassabb parallax, halványabb. */}
        <g className="jg-motion-parallax-far">
          <Candle
            x={54} bodyY={214} bodyHeight={104} wickTop={186} wickBottom={344}
            fill="#B7C2CA" motionClass="jg-motion-candle" delay="-2.4s" opacity={0.5}
          />
          <Candle
            x={252} bodyY={150} bodyHeight={132} wickTop={122} wickBottom={306}
            fill="#B7C2CA" motionClass="jg-motion-candle-inv" delay="-5.1s" opacity={0.45}
          />
          <Candle
            x={470} bodyY={196} bodyHeight={96} wickTop={170} wickBottom={318}
            fill="#B7C2CA" motionClass="jg-motion-candle" delay="-7.3s" opacity={0.5}
          />
        </g>

        {/* Közeli gyertyaréteg — eltérő magasság, pozíció és ritmus. */}
        <g className="jg-motion-parallax-near">
          <Candle
            x={120} bodyY={252} bodyHeight={88} wickTop={228} wickBottom={362}
            fill="#5B7184" motionClass="jg-motion-candle-inv" delay="-1.1s" opacity={0.9}
          />
          <Candle
            x={196} bodyY={186} bodyHeight={150} wickTop={158} wickBottom={360}
            fill="#182631" motionClass="jg-motion-candle" delay="-4.6s" opacity={0.88}
          />
          <Candle
            x={392} bodyY={224} bodyHeight={118} wickTop={198} wickBottom={366}
            fill="#182631" motionClass="jg-motion-candle-inv" delay="-6.8s" opacity={0.86}
          />
          <Candle
            x={462} bodyY={276} bodyHeight={70} wickTop={252} wickBottom={368}
            fill="#5B7184" motionClass="jg-motion-candle" delay="-3.2s" opacity={0.9}
          />
          <Candle
            x={540} bodyY={206} bodyHeight={136} wickTop={180} wickBottom={364}
            fill="#5B7184" motionClass="jg-motion-candle-inv" delay="-8.5s" opacity={0.72}
          />
        </g>

        {/* Talajvonal — semleges, nem tengely és nem chartvonal. */}
        <rect x="0" y="392" width="640" height="2" rx="1" fill="url(#jgGroundFade)" />

        {/* Figura: oldalirányú haladás → lépés-/ugrásciklus → törzsdőlés. */}
        <g className="jg-motion-figure-travel">
          <g className="jg-motion-figure-gait">
            <g transform="translate(300 0)">
              <g className="jg-motion-figure-lean">
                {/* Hátsó kar */}
                <g
                  className="jg-motion-limb-b"
                  style={{ transformOrigin: "0px 244px", animationDelay: "-0.2s" }}
                >
                  <rect x="-6" y="242" width="12" height="62" rx="6" fill="url(#jgFigureFill)" opacity="0.72" />
                </g>

                {/* Hátsó láb */}
                <g
                  className="jg-motion-limb-a"
                  style={{ transformOrigin: "0px 320px", animationDelay: "-0.2s" }}
                >
                  <rect x="-7" y="318" width="14" height="72" rx="7" fill="url(#jgFigureFill)" opacity="0.72" />
                </g>

                {/* Törzs — egyszerű, arctalan, nem öltönyös sziluett. */}
                <path
                  d="M0 224 C 15 224 24 234 24 248 L 24 300 C 24 314 15 322 0 322 C -15 322 -24 314 -24 300 L -24 248 C -24 234 -15 224 0 224 Z"
                  fill="url(#jgFigureFill)"
                />
                <path
                  d="M0 224 C 15 224 24 234 24 248 L 24 300 C 24 314 15 322 0 322 C -15 322 -24 314 -24 300 L -24 248 C -24 234 -15 224 0 224 Z"
                  fill="none"
                  stroke="url(#jgFigureRim)"
                  strokeWidth="1.6"
                />

                {/* Fej — arctalan, sima forma, nincs arcvonás. */}
                <circle cx="0" cy="198" r="21" fill="url(#jgFigureFill)" />
                <circle cx="0" cy="198" r="21" fill="none" stroke="url(#jgFigureRim)" strokeWidth="1.6" />
                {/* Kontúrfény a fej felső ívén. */}
                <path
                  d="M -13 188 A 21 21 0 0 1 11 184"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeOpacity="0.45"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />

                {/* Elülső láb */}
                <g
                  className="jg-motion-limb-b"
                  style={{ transformOrigin: "0px 320px" }}
                >
                  <rect x="-7" y="318" width="14" height="72" rx="7" fill="url(#jgFigureFill)" />
                  <rect x="-7" y="318" width="14" height="72" rx="7" fill="none" stroke="url(#jgFigureRim)" strokeWidth="1.2" />
                </g>

                {/* Elülső kar */}
                <g
                  className="jg-motion-limb-a"
                  style={{ transformOrigin: "0px 244px" }}
                >
                  <rect x="-6" y="242" width="12" height="62" rx="6" fill="url(#jgFigureFill)" />
                  <rect x="-6" y="242" width="12" height="62" rx="6" fill="none" stroke="url(#jgFigureRim)" strokeWidth="1.2" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
