/*
 * Képkocka-sorozatok közös segédfüggvényei (TradingPlatforms: telefon + laptop).
 *
 * A telefon (mobiltrader) és a laptop (webtrader) ugyanazt a betöltési
 * stratégiát és ugyanazt a „legközelebbi kocka" szabályt használja; a laptop
 * kockái nagyobbak, ezért ott a dekódolt képeket egy csúszó ablakban tartjuk
 * (createWindowedPlayer). A telefon viselkedését ez a fájl NEM változtatja:
 * a segédfüggvények a korábbi, beágyazott logikával megegyeznek.
 */

/** Az utolsó kocka, amelynek előrehaladása <= p (bináris keresés). */
export function frameIndexAt(progress: readonly number[], p: number): number {
  let lo = 0;
  let hi = progress.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (progress[mid] <= p) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/**
 * Betöltési sorrend a 0. kocka UTÁN: durvából finomba — az utolsó, majd
 * minden 8., 4., 2., végül minden kocka. Lassú hálózaton is bármely
 * előrehaladáshoz van közeli kocka.
 */
export function coarseToFineOrder(n: number): number[] {
  const order: number[] = [n - 1];
  for (const step of [8, 4, 2, 1]) {
    for (let i = 1; i < n; i += step) if (!order.includes(i)) order.push(i);
  }
  return order;
}

/**
 * A kért kocka, vagy ha az még nincs meg, a legközelebbi meglévő (mindkét
 * irányban; egyenlő távolságnál a korábbi). -1, ha egyik sincs meg.
 */
export function nearestAvailable(
  wanted: number,
  count: number,
  has: (i: number) => boolean,
): number {
  for (let d = 0; d < count; d++) {
    if (wanted - d >= 0 && has(wanted - d)) return wanted - d;
    if (wanted + d < count && has(wanted + d)) return wanted + d;
  }
  return -1;
}

/**
 * Az első kocka (a kezdőállapot sosem más kocka), majd a durva→finom sorrend,
 * `concurrency` párhuzamos letöltéssel.
 */
export async function loadInOrder(
  count: number,
  loadOne: (i: number) => Promise<void>,
  isCancelled: () => boolean,
  concurrency = 6,
): Promise<void> {
  await loadOne(0);
  const order = coarseToFineOrder(count);
  let next = 0;
  const worker = async () => {
    while (!isCancelled() && next < order.length) await loadOne(order[next++]);
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
}

/* ------------------------------------------------------------------------ */

type Decoded = CanvasImageSource & { close?: () => void };

async function decodeBlob(blob: Blob): Promise<Decoded> {
  if (typeof createImageBitmap === "function") return createImageBitmap(blob);
  // Régebbi böngészők: <img> objektum-URL-ről; a close() felszabadítja az URL-t.
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
  return Object.assign(img, { close: () => URL.revokeObjectURL(url) });
}

export interface WindowedPlayer {
  /** A kért előrehaladás (0–1) beállítása; kirajzol a canvasra. */
  setProgress: (p: number) => void;
  /** Betöltés indítása (egyszer). */
  start: () => void;
  dispose: () => void;
  /** Hibakereséshez / teszteléshez: dekódolt kockák száma. */
  stats: () => { fetched: number; decoded: number; wanted: number; drawn: number };
}

/**
 * Nagy kockák lejátszója: a tömörített kockák (Blob) mind letöltődnek (a
 * telefonnal azonos sorrendben), de dekódolva csak a kért kocka körüli
 * `keep` sugarú ablak él (ImageBitmap), a többi felszabadul. Ha a kért kocka
 * még nincs letöltve, a legközelebbi letöltött látszik, mindkét irányban; ha
 * le van töltve, de nincs dekódolva, a kirajzolt kocka addig marad, amíg a
 * (néhány ms-os) dekódolás be nem fejeződik — nincs üres vagy villódzó kép.
 */
export function createWindowedPlayer(opts: {
  canvas: HTMLCanvasElement;
  progress: readonly number[];
  url: (i: number) => string;
  keep?: number;
  concurrency?: number;
  onReady?: () => void;
}): WindowedPlayer {
  const { canvas, progress, url } = opts;
  const keep = opts.keep ?? 5;
  const n = progress.length;
  const ctx = canvas.getContext("2d");
  const blobs: (Blob | null)[] = Array.from({ length: n }, () => null);
  const decoded: (Decoded | null)[] = Array.from({ length: n }, () => null);
  const pending = new Set<number>();
  let wanted = 0;
  let drawn = -1;
  let started = false;
  let disposed = false;
  let readyFired = false;

  const evict = () => {
    for (let j = 0; j < n; j++) {
      const d = decoded[j];
      if (d && j !== drawn && Math.abs(j - wanted) > keep + 1) {
        d.close?.();
        decoded[j] = null;
      }
    }
  };

  const decode = (i: number) => {
    if (decoded[i] || pending.has(i) || !blobs[i] || disposed) return;
    pending.add(i);
    decodeBlob(blobs[i]!)
      .then((d) => {
        if (disposed) {
          d.close?.();
          return;
        }
        decoded[i] = d;
        render();
      })
      .catch(() => {
        /* Hibás kocka: kimarad, a legközelebbi kocka / poszter marad látható. */
      })
      .finally(() => pending.delete(i));
  };

  const render = () => {
    if (!ctx || disposed) return;
    const target = nearestAvailable(wanted, n, (i) => blobs[i] !== null);
    if (target < 0) return;
    const d = decoded[target];
    if (d) {
      if (target !== drawn) {
        ctx.drawImage(d, 0, 0, canvas.width, canvas.height);
        drawn = target;
        canvas.dataset.drawn = String(target);
        if (!readyFired) {
          readyFired = true;
          canvas.dataset.ready = "true";
          opts.onReady?.();
        }
      }
    } else {
      decode(target);
    }
    // A kért kocka körüli ablak előre-dekódolása (a kért kockától kifelé).
    for (let d2 = 0; d2 <= keep; d2++) {
      if (wanted - d2 >= 0) decode(wanted - d2);
      if (wanted + d2 < n) decode(wanted + d2);
    }
    evict();
  };

  const loadOne = async (i: number) => {
    try {
      const res = await fetch(url(i));
      if (!res.ok) return;
      const blob = await res.blob();
      if (disposed) return;
      blobs[i] = blob;
      // Csak akkor érdemes újrarajzolni, ha ez a kocka a kért közelében van.
      if (Math.abs(i - wanted) <= keep + 1 || drawn < 0) render();
    } catch {
      /* Hibás kocka: kimarad. */
    }
  };

  return {
    setProgress(p) {
      const i = frameIndexAt(progress, p);
      if (i === wanted && i === drawn) return;
      wanted = i;
      canvas.dataset.wanted = String(i);
      render();
    },
    start() {
      if (started) return;
      started = true;
      void loadInOrder(n, loadOne, () => disposed, opts.concurrency ?? 6);
    },
    dispose() {
      disposed = true;
      for (let j = 0; j < n; j++) {
        decoded[j]?.close?.();
        decoded[j] = null;
        blobs[j] = null;
      }
    },
    stats() {
      return {
        fetched: blobs.filter(Boolean).length,
        decoded: decoded.filter(Boolean).length,
        wanted,
        drawn,
      };
    },
  };
}
