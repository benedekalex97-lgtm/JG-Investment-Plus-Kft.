import { JG_MARK_PATH, JG_MARK_VIEWBOX } from "@/components/Logo";

/**
 * Az embléma geometriája — KIZÁRÓLAG a mester-SVG-ből (Logo.tsx:
 * JG_MARK_PATH / JG_MARK_VIEWBOX, ld. docs/brand/logo-system-v1.md §3).
 *
 * A mester-path egyetlen path, három subpathtal. Itt ezt bontjuk három
 * külön alakzatra, az EREDETI koordináták megőrzésével: nincs újrarajzolás,
 * nincs kerekítés, nincs negyedik elem. Ha a mester-path változik, a 3D
 * jelenet és a statikus fallback is automatikusan követi.
 */

export type PieceKey = "cap" | "left" | "right";
export type Point = readonly [number, number];

export type MarkPiece = {
  key: PieceKey;
  /** Az eredeti SVG-subpath (a statikus fallback ezt rajzolja ki). */
  d: string;
  /** Csúcsok az eredeti SVG-koordinátákban (y lefelé). */
  points: readonly Point[];
  /** Felület (logóegység²) — a súlypont-megtartáshoz. */
  area: number;
};

export type Mark = {
  viewBox: { x: number; y: number; width: number; height: number };
  pieces: Record<PieceKey, MarkPiece>;
};

/** Előjeles terület (shoelace). */
function signedArea(points: readonly Point[]) {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

function centroidOf(points: readonly Point[]): Point {
  const x = points.reduce((s, p) => s + p[0], 0) / points.length;
  const y = points.reduce((s, p) => s + p[1], 0) / points.length;
  return [x, y];
}

function parseMark(path: string, viewBox: string): Mark {
  const [x, y, width, height] = viewBox.trim().split(/[\s,]+/).map(Number);
  const subpaths = path.split(/(?=M)/).map((part) => part.trim()).filter(Boolean);

  if (subpaths.length !== 3) {
    throw new Error(`JG mark: 3 subpath várt, ${subpaths.length} érkezett.`);
  }

  const parsed = subpaths.map((d) => {
    // A mester-path csak abszolút M + implicit lineto + Z elemekből áll.
    if (!/^M[\d\s.,-]+Z$/.test(d)) {
      throw new Error(`JG mark: nem támogatott subpath: ${d}`);
    }
    const numbers = d.slice(1, -1).trim().split(/[\s,]+/).map(Number);
    const points: Point[] = [];
    for (let i = 0; i < numbers.length; i += 2) points.push([numbers[i], numbers[i + 1]]);
    return { d, points, area: Math.abs(signedArea(points)), centroid: centroidOf(points) };
  });

  // Besorolás a geometria alapján, nem a sorrend alapján: a legmagasabban
  // ülő elem a fedőlap, a maradék kettő közül a bal oldali a bal pillér.
  const sortedByHeight = [...parsed].sort((a, b) => a.centroid[1] - b.centroid[1]);
  const cap = sortedByHeight[0];
  const [left, right] = sortedByHeight.slice(1).sort((a, b) => a.centroid[0] - b.centroid[0]);

  const piece = (key: PieceKey, p: (typeof parsed)[number]): MarkPiece => ({
    key,
    d: p.d,
    points: p.points,
    area: p.area,
  });

  return {
    viewBox: { x, y, width, height },
    pieces: { cap: piece("cap", cap), left: piece("left", left), right: piece("right", right) },
  };
}

export const MARK = parseMark(JG_MARK_PATH, JG_MARK_VIEWBOX);

export const PIECE_KEYS: readonly PieceKey[] = ["cap", "left", "right"];

/**
 * SVG-koordináta -> jelenet-koordináta: az embléma magassága 1 egység, a
 * középpontja az origó, az y tengely felfelé mutat. Egyenletes skálázás és
 * eltolás — az arányok és a szögek nem változnak.
 */
export function toScene([px, py]: Point): Point {
  const { x, y, width, height } = MARK.viewBox;
  return [(px - (x + width / 2)) / height, (y + height / 2 - py) / height];
}

/** A logóegység a jelenet egységében (1 / emblémamagasság). */
export const UNIT = 1 / MARK.viewBox.height;

/** Az embléma fél szélessége a jelenet egységében. */
export const HALF_WIDTH = MARK.viewBox.width / 2 / MARK.viewBox.height;

export type Explode = { lift: number; spread: number };

/**
 * A széthúzott állapot eltolásai (jelenet-egységben, y felfelé).
 *
 * A pillérek lefelé mozdulását (drop) a súlypont-feltétel adja: a felső
 * elem felemelése és a két pillér süllyesztése kiegyenlíti egymást, így a
 * három elem felület-súlypontja — a csoport optikai középpontja — a mozgás
 * teljes ideje alatt helyben marad:
 *
 *   A_cap · lift = (A_left + A_right) · drop
 */
export function explodeOffsets({ lift, spread }: Explode): Record<PieceKey, Point> {
  const { cap, left, right } = MARK.pieces;
  const drop = (lift * cap.area) / (left.area + right.area);
  return {
    cap: [0, lift],
    left: [-spread, -drop],
    right: [spread, -drop],
  };
}
