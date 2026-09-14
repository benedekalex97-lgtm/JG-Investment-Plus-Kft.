/**
 * HeroVisual — a Hero jobb oldali, teljesen statikus vizuális kompozíciója.
 *
 * v0.3: a v0.2 "Continuous Market Journey" mozgó jelenete (futó/sétáló
 * figura, emelkedő/süllyedő gyertyák, parallax, kamerakövetés,
 * requestAnimationFrame-hurok) teljes egészében megszűnt. Nincs itt sem
 * `useEffect`, sem `ref`, sem semmilyen JS-logika — ez egy tiszta,
 * szerver-renderelhető prezentációs komponens, fix koordinátákkal.
 *
 * A figura egyszerű, arctalan, nemsemleges sziluett, nyugodt, stabil
 * állásban: a lábak enyhe, természetes eltolása és a fej/törzs semleges
 * tartása tájékozódást és rendezett, magabiztos jelenlétet sugall —
 * NEM futást, sétát, ugrást vagy győzelmi pózt.
 *
 * A japán gyertyákra utaló formák absztrakt, lekerekített oszlopok, két
 * statikus mélységi rétegben (távolabbi, világosabb / közelebbi, sötétebb)
 * a visszafogott térbeliség kedvéért — mozgás, tengely, szám, ár, százalék
 * vagy piros/zöld szín nélkül, így nem kereskedési felületre, hanem
 * absztrakt architektúrai térre emlékeztetnek.
 *
 * Anyagérzet: Smoked Graphite + frosted Aubergine belső tónus, finom Cool
 * Silver kontúrfénnyel — ugyanaz a gradiens-nyelv, amit a korábbi verziók
 * is használtak, most kizárólag statikus kontextusban.
 *
 * A teljes SVG dekoratív (aria-hidden), nem terhel képernyőolvasót.
 */

const VIEW_W = 640;
const VIEW_H = 440;
const GROUND_Y = 328;

const THIGH_LEN = 46;
const SHIN_LEN = 42;
const LIMB_W_LEG = 13;

const UPPER_ARM_LEN = 30;
const LOWER_ARM_LEN = 27;
const LIMB_W_ARM = 11;

const TORSO_H = 72;
const TORSO_W = 40;
const HEAD_R = 15;

const FOOT_LEN = 21;
const FOOT_H = 9;

type Candle = {
  x: number;
  width: number;
  height: number;
  bottomGap: number;
};

/** Közelebbi, sötétebb, talajon álló oszlopok. */
const NEAR_CANDLES: Candle[] = [
  { x: 388, width: 26, height: 64, bottomGap: 0 },
  { x: 424, width: 34, height: 98, bottomGap: 0 },
  { x: 466, width: 24, height: 52, bottomGap: 0 },
  { x: 500, width: 30, height: 80, bottomGap: 0 },
];

/** Távolabbi, világosabb, a talajtól kissé elemelt oszlopok — finom
 *  mélységérzet, mozgás nélkül. */
const FAR_CANDLES: Candle[] = [
  { x: 356, width: 18, height: 46, bottomGap: 26 },
  { x: 540, width: 20, height: 58, bottomGap: 18 },
  { x: 574, width: 16, height: 38, bottomGap: 30 },
];

function CandleShape({ candle, fillId }: { candle: Candle; fillId: string }) {
  const y = GROUND_Y - candle.bottomGap - candle.height;
  return (
    <g>
      <rect
        x={candle.x - candle.width / 2}
        y={y}
        width={candle.width}
        height={candle.height}
        rx={Math.min(14, candle.width / 2.4)}
        fill={fillId}
      />
      <rect
        x={candle.x - candle.width / 2 + 4}
        y={y + 4}
        width={candle.width - 8}
        height={Math.max(4, candle.height * 0.12)}
        rx={3}
        style={{ fill: "var(--color-cool-silver)" }}
        opacity={0.14}
      />
    </g>
  );
}

export default function HeroVisual() {
  return (
    <div className="relative w-full select-none" aria-hidden="true">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="presentation"
        focusable="false"
        className="block h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Smoked Graphite + frosted Aubergine belső tónus — a figura anyaga. */}
          <linearGradient id="jgFigureFill" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--color-ink)" }} stopOpacity="0.88" />
            <stop offset="55%" style={{ stopColor: "var(--color-aubergine)" }} stopOpacity="0.78" />
            <stop offset="100%" style={{ stopColor: "var(--color-aubergine)" }} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="jgFigureRim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--color-cool-silver)" }} stopOpacity="0.7" />
            <stop offset="60%" style={{ stopColor: "var(--color-cool-silver)" }} stopOpacity="0.1" />
            <stop offset="100%" style={{ stopColor: "var(--color-cool-silver)" }} stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id="jgGlow" cx="46%" cy="58%" r="55%">
            <stop offset="0%" style={{ stopColor: "var(--color-aubergine)" }} stopOpacity="0.1" />
            <stop offset="100%" style={{ stopColor: "var(--color-aubergine)" }} stopOpacity="0" />
          </radialGradient>
          {/* Közeli gyertyák: visszafogott, áttetsző Smoked Graphite. */}
          <linearGradient id="jgNearFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--color-ink)" }} stopOpacity="0.62" />
            <stop offset="100%" style={{ stopColor: "var(--color-carbon)" }} stopOpacity="0.72" />
          </linearGradient>
        </defs>

        <ellipse cx="300" cy="240" rx="230" ry="170" fill="url(#jgGlow)" />

        {/* Távoli réteg — világosabb, elemelt, a mélységérzetet adja. */}
        <g opacity={0.5}>
          {FAR_CANDLES.map((c) => (
            <CandleShape key={`far-${c.x}`} candle={c} fillId="var(--color-cool-silver)" />
          ))}
        </g>

        {/* Közeli réteg — a fő architektúrai tér. */}
        <g>
          {NEAR_CANDLES.map((c) => (
            <CandleShape key={`near-${c.x}`} candle={c} fillId="url(#jgNearFill)" />
          ))}
        </g>

        {/* Talajvonal — semleges, nem tengely és nem chartvonal. */}
        <rect x="140" y={GROUND_Y + 2} width="360" height="1.5" fill="var(--color-border-strong)" opacity={0.5} />

        {/* A figura — nyugodt, stabil állás. Enyhe, természetes lábeltolás
            és minimális könyékhajlítás adja a "rendezett, előretekintő
            jelenlét" érzetét; semmi nem lendül, nem hajlik ciklikusan. */}
        <g transform={`translate(230 ${GROUND_Y})`}>
          {/* Hátsó (bal) láb — enyhén hátrébb, súlytartó. */}
          <g transform="rotate(-6)">
            <rect
              x={-LIMB_W_LEG / 2}
              y={0}
              width={LIMB_W_LEG}
              height={THIGH_LEN}
              rx={LIMB_W_LEG / 2}
              fill="url(#jgFigureFill)"
            />
            <g transform={`translate(0 ${THIGH_LEN}) rotate(4)`}>
              <rect
                x={-LIMB_W_LEG / 2 + 1}
                y={0}
                width={LIMB_W_LEG - 2}
                height={SHIN_LEN}
                rx={(LIMB_W_LEG - 2) / 2}
                fill="url(#jgFigureFill)"
              />
              <g transform={`translate(0 ${SHIN_LEN})`}>
                <rect
                  x={-6}
                  y={-FOOT_H / 2}
                  width={FOOT_LEN}
                  height={FOOT_H}
                  rx={FOOT_H / 2}
                  fill="url(#jgFigureFill)"
                />
              </g>
            </g>
          </g>

          {/* Elülső (jobb) láb — enyhén előrébb, nyugodt testsúlyelosztás. */}
          <g transform="rotate(11)">
            <rect
              x={-LIMB_W_LEG / 2}
              y={0}
              width={LIMB_W_LEG}
              height={THIGH_LEN}
              rx={LIMB_W_LEG / 2}
              fill="url(#jgFigureFill)"
            />
            <g transform={`translate(0 ${THIGH_LEN}) rotate(-6)`}>
              <rect
                x={-LIMB_W_LEG / 2 + 1}
                y={0}
                width={LIMB_W_LEG - 2}
                height={SHIN_LEN}
                rx={(LIMB_W_LEG - 2) / 2}
                fill="url(#jgFigureFill)"
              />
              <g transform={`translate(0 ${SHIN_LEN})`}>
                <rect
                  x={-6}
                  y={-FOOT_H / 2}
                  width={FOOT_LEN}
                  height={FOOT_H}
                  rx={FOOT_H / 2}
                  fill="url(#jgFigureFill)"
                />
              </g>
            </g>
          </g>

          {/* Törzs — csaknem egyenes tartás, minimális, statikus dőlés. */}
          <g transform={`translate(0 0) rotate(-1)`}>
            <path
              d={`M0 ${-TORSO_H} C ${TORSO_W / 2} ${-TORSO_H} ${TORSO_W / 2 + 4} ${-TORSO_H + 18} ${TORSO_W / 2} ${-TORSO_H / 2}
                  C ${TORSO_W / 2 - 2} ${-14} ${TORSO_W / 2 - 8} 0 0 0
                  C ${-(TORSO_W / 2 - 8)} 0 ${-(TORSO_W / 2 - 2)} -14 ${-TORSO_W / 2} ${-TORSO_H / 2}
                  C ${-(TORSO_W / 2 + 4)} ${-TORSO_H + 18} ${-TORSO_W / 2} ${-TORSO_H} 0 ${-TORSO_H} Z`}
              fill="url(#jgFigureFill)"
            />
            <path
              d={`M0 ${-TORSO_H} C ${TORSO_W / 2} ${-TORSO_H} ${TORSO_W / 2 + 4} ${-TORSO_H + 18} ${TORSO_W / 2} ${-TORSO_H / 2}
                  C ${TORSO_W / 2 - 2} ${-14} ${TORSO_W / 2 - 8} 0 0 0`}
              fill="none"
              stroke="url(#jgFigureRim)"
              strokeWidth="1.6"
            />

            {/* Hátsó (bal) kar — nyugodtan a test mellett. */}
            <g transform={`translate(-15 ${-TORSO_H + 10}) rotate(-4)`}>
              <rect
                x={-LIMB_W_ARM / 2}
                y={0}
                width={LIMB_W_ARM}
                height={UPPER_ARM_LEN}
                rx={LIMB_W_ARM / 2}
                fill="url(#jgFigureFill)"
              />
              <g transform={`translate(0 ${UPPER_ARM_LEN}) rotate(-9)`}>
                <rect
                  x={-LIMB_W_ARM / 2 + 1}
                  y={0}
                  width={LIMB_W_ARM - 2}
                  height={LOWER_ARM_LEN}
                  rx={(LIMB_W_ARM - 2) / 2}
                  fill="url(#jgFigureFill)"
                />
              </g>
            </g>

            {/* Elülső (jobb) kar — minimális könyékhajlítás, természetes
                asszimetria, nem lendülő pozíció. */}
            <g transform={`translate(15 ${-TORSO_H + 10}) rotate(7)`}>
              <rect
                x={-LIMB_W_ARM / 2}
                y={0}
                width={LIMB_W_ARM}
                height={UPPER_ARM_LEN}
                rx={LIMB_W_ARM / 2}
                fill="url(#jgFigureFill)"
              />
              <g transform={`translate(0 ${UPPER_ARM_LEN}) rotate(14)`}>
                <rect
                  x={-LIMB_W_ARM / 2 + 1}
                  y={0}
                  width={LIMB_W_ARM - 2}
                  height={LOWER_ARM_LEN}
                  rx={(LIMB_W_ARM - 2) / 2}
                  fill="url(#jgFigureFill)"
                />
              </g>
            </g>

            {/* Fej — arctalan, szintben, előretekintő tartás. */}
            <g transform={`translate(0 ${-TORSO_H})`}>
              <circle cx="0" cy={-HEAD_R - 1} r={HEAD_R} fill="url(#jgFigureFill)" />
              <path
                d={`M ${-HEAD_R * 0.62} ${-HEAD_R * 1.7} A ${HEAD_R} ${HEAD_R} 0 0 1 ${HEAD_R * 0.52} ${-HEAD_R * 1.86}`}
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity="0.4"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
