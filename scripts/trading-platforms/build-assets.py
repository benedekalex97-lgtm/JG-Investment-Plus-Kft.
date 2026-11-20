"""
Kereskedési felületek — forrásanyag-feldolgozás (JG Investment Plus).

A végső, optimalizált asseteket állítja elő a hivatalos K&H forrásokból.
Az eredeti (nagy) források NEM részei a repositorynak; lásd
docs/trading-platforms-sources.md a letöltési URL-ekért és a döntésekért.

Függőségek: Pillow (py -3 -m pip install --user pillow), ffmpeg a PATH-on.

Használat (Windows / PowerShell):
    py -3 scripts/trading-platforms/build-assets.py --mobiltrader <forrásmappa>
    py -3 scripts/trading-platforms/build-assets.py --webtrader   <forrásmappa>
    py -3 scripts/trading-platforms/build-assets.py --manifest-only
    py -3 scripts/trading-platforms/build-assets.py <forrásmappa>      (mindkettő)

A forrásmappában ezeknek kell lenniük:
    13112.gif          K&H mobiltrader — „értékpapírok" GIF
    pqAbdMKSSvM.mp4    K&H webtrader — portfólió menü áttekintése  (1920×1080)
    v_AP_bpaKkI.mp4    K&H webtrader — megbízás beadása
    75gK6HnQPvA.mp4    K&H webtrader — pénzműveletek
    MJRRY_CtKSk.mp4    K&H webtrader — rendszeres befektetés

Kimenet:
    public/trading-platforms/mobiltrader/f-###.webp
    public/trading-platforms/webtrader/{1280,760}/f-###.webp
    src/content/trading-platforms-frames.ts  (a képkocka-manifeszt)
"""

import io
import os
import subprocess
import sys

from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public", "trading-platforms")
OUT_M = os.path.join(OUT, "mobiltrader")
OUT_W = os.path.join(OUT, "webtrader")

# --- Webtrader (az új „webtrader 2.0", négy hivatalos oktatóvideó) ----------
# Mind a négy videó 1920×1080-as képernyőfelvétel; a böngészőoldal ablaka
# (viewport) minden videóban ugyanott van. A vágás csak az oldalt tartja meg:
# lekerül a böngésző címsora a bővítmény-ikonokkal, a Windows-tálca az órával,
# és a jobb szélső görgetősáv. (A pénzműveletes videóban a böngésző- és
# tálcasáv eleve fehérre van kitakarva, így a vágás a négy videót egységessé
# teszi.)
WT_CROP = (7, 95, 1904, 1024)  # x0, y0, x1, y1 a forráskockán
WT_SIZE = (1280, 627)  # desktop; a vágás 1897 × 929 px -> 2,04 : 1
WT_SIZES = {"1280": 1280, "760": 760}
WT_QUALITY = {"1280": 74, "760": 72}

# A jobb felső felhasználói avatar („TA" monogram, sötétkék kör) forráskocka-
# koordinátái. Ahol az avatar látszik (a jobb oldali panel nem takarja), a
# területet végleges pixelezéssel kitakarjuk; a kép így nem tartalmaz monogramot.
AVATAR_BOX = (1826, 112, 1898, 170)
# Ugyanez a monogram a „megbízás összefoglaló" panel „számlára" sorában is
# megjelenik (kisebb, fekete kör). A küszöb az adott doboz sötét-pixel aránya.
AVATAR_BOXES = [
    (AVATAR_BOX, 0.22),
    ((1672, 305, 1718, 347), 0.12),
]

# Forrás-azonosítók -> fájl.
WT_VIDEOS = {
    "pqAbdMKSSvM": "pqAbdMKSSvM.mp4",  # portfólió menü áttekintése
    "v_AP_bpaKkI": "v_AP_bpaKkI.mp4",  # megbízás beadása
    "75gK6HnQPvA": "75gK6HnQPvA.mp4",  # pénzműveletek
    "MJRRY_CtKSk": "MJRRY_CtKSk.mp4",  # rendszeres befektetés
}

# A jelenetsor szakaszai: (videó, [kockaidők mp-ben], előrehaladás-tól, -ig).
# Egy szakaszon belül a kockák egyenletes ütemet kapnak. A telefon a Tesla
# adatlapját a 0,594–0,608 előrehaladásnál nyitja meg: a laptop az OTP Bank
# adatlapjának betöltését ugyanide igazítja (1. és 2. szakasz vége, 3. eleje).
WT_SEGMENTS = [
    # 1. Portfólió áttekintése — „portfólió menü áttekintése", 2025-04-04 10:47
    ("pqAbdMKSSvM", [4.5, 8.4, 9.4, 10.5, 11.0, 12.1, 12.6, 13.1, 13.7, 14.2, 15.0,
                     15.8, 16.5, 17.2, 18.0, 18.7, 19.4, 20.0, 20.6, 21.2, 22.0, 22.8,
                     23.6], 0.020, 0.280),
    # 2. Részvény kiválasztása kurzorral — „megbízás beadása", 2025-04-03 15:27
    ("v_AP_bpaKkI", [4.5, 5.4, 6.6, 8.4, 10.4, 11.8, 12.3, 13.0, 13.8, 14.6, 15.4, 16.2,
                     17.0, 17.8, 18.4, 19.6, 20.2], 0.296, 0.587),
    # 3. Adatlap grafikonnal és a felületen belüli görgetés
    ("v_AP_bpaKkI", [21.4, 22.0, 22.4, 22.8, 23.2, 23.6, 24.0, 24.4, 24.9, 25.4, 26.0,
                     26.8], 0.608, 0.700),
    # 4. A megbízás beadásának lépései
    ("v_AP_bpaKkI", [27.6, 28.4, 29.4, 30.3, 31.4, 32.6, 34.0, 35.4, 36.6, 39.4, 40.6,
                     42.2], 0.712, 0.822),
    # 5. Pénzműveletek — „pénzműveletek", 2025-04-04 13:3x
    ("75gK6HnQPvA", [4.5, 8.0, 11.5, 15.0, 19.5, 127.0, 130.0, 140.0, 150.0, 157.0,
                     165.0], 0.834, 0.906),
    # 6. Rendszeres befektetés — „rendszeres befektetés", 2025-05-28
    # (a jelenet a rendszeres befektetések listáján ér véget; a lemondás-panel kimarad)
    ("MJRRY_CtKSk", [25.8, 27.0, 30.5, 33.5, 36.6, 39.6, 43.0, 46.5, 49.5, 51.2,
                     52.3], 0.918, 0.970),
]

# --- Mobiltrader ------------------------------------------------------------
# A 13112.gif minden képkockája 100 ms. A kiválasztott képkockák (forrás-
# sorszámok) — a hosszú állóképeket és a betöltés-pörgettyű ismétlődő
# kockáit ritkítjuk, a 186–197. kockák (visszagörgetés a lap tetejére)
# kimaradnak: a jelenet a Teljesítmény-adatoknál ér véget.
M_FRAMES = (
    [0]
    + [22, 23, 24, 25, 27, 28, 29, 31, 38]
    + [55, 61, 62, 63, 64, 65, 66]
    + [74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 87, 89, 91, 93]
    + [96, 97, 101, 106, 114, 115, 116]
    + [119, 122, 125, 128, 131, 134, 137, 140, 143, 146, 149, 152, 155]
    + [157, 167, 168]
    + list(range(172, 186))
)

# Görgetési hozzárendelés (v1.2, egyenletes ütem).
# A v1.0 a forrás IDEJÉHEZ kötötte az előrehaladást: a 0–0,16 és a 0,90–1
# sáv mozdulatlan volt, a gyors UI-átmenet (22–31. kocka) viszont ~20 px
# görgetésre jutott — mobilon ez „beragad, majd ugrik" érzetet adott.
# Most minden kiválasztott kocka közel azonos görgetési lépést kap; a
# betöltés-pörgettyű kockái fél súllyal szerepelnek. Rövid kezdő- és
# záró-állás marad, hogy az első és az utolsó állapot is látható legyen.
P_START, P_END = 0.06, 0.94
SPINNER = range(120, 157)


def frame_progress() -> list:
    weights = [0.0] + [0.5 if f in SPINNER else 1.0 for f in M_FRAMES[1:]]
    total = sum(weights)
    out, acc = [], 0.0
    for f, w in zip(M_FRAMES, weights):
        acc += w
        out.append((f, round(P_START + (P_END - P_START) * acc / total, 4)))
    return out


def webtrader_frames() -> list:
    """[(forrás-id, idő mp, előrehaladás), ...] — szakaszonként egyenletes ütem."""
    out = []
    for vid, times, p0, p1 in WT_SEGMENTS:
        n = len(times)
        for i, t in enumerate(times):
            p = p0 + (p1 - p0) * (i / (n - 1) if n > 1 else 0)
            out.append((vid, t, round(p, 4)))
    return out


# --- Segédfüggvények ----------------------------------------------------------
def pixelate(im: Image.Image, box, block: int = 12) -> Image.Image:
    region = im.crop(box)
    w, h = region.size
    region = region.resize((max(1, w // block), max(1, h // block)), Image.BOX)
    region = region.resize((w, h), Image.NEAREST).filter(ImageFilter.GaussianBlur(3))
    im.paste(region, box)
    return im


def avatar_boxes_visible(im: Image.Image) -> list:
    """Mely dobozokban látszik a sötét avatar-kör? (A jobb oldali panel —
    vétel, beutalás stb. — eltakarja a címsori avatart; ott a doboz nem
    tartalmaz sötét kört, és a panel elemeit nem szabad szétkenni.)"""
    out = []
    for box, thr in AVATAR_BOXES:
        px = im.crop(box).convert("L").tobytes()
        dark = sum(1 for v in px if v < 80)
        if dark / len(px) > thr:
            out.append(box)
    return out


def grab(video_path: str, t: float) -> Image.Image:
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", video_path,
         "-frames:v", "1", "-f", "image2pipe", "-c:v", "png", "-"],
        capture_output=True, check=True,
    ).stdout
    return Image.open(io.BytesIO(out)).convert("RGB")


def process_wt_frame(im: Image.Image) -> tuple:
    boxes = avatar_boxes_visible(im)
    for box in boxes:
        im = pixelate(im, box)
    return im.crop(WT_CROP), boxes


def build_webtrader(src_dir: str) -> None:
    for size in WT_SIZES:
        os.makedirs(os.path.join(OUT_W, size), exist_ok=True)
        for f in os.listdir(os.path.join(OUT_W, size)):
            if f.endswith(".webp"):
                os.remove(os.path.join(OUT_W, size, f))
    totals = {s: 0 for s in WT_SIZES}
    masked_n = 0
    for i, (vid, t, p) in enumerate(webtrader_frames()):
        im = grab(os.path.join(src_dir, WT_VIDEOS[vid]), t)
        crop, boxes = process_wt_frame(im)
        masked_n += len(boxes)
        # Kitakarás nélküli (a jobb oldali panel által eltakart avatar) és
        # kétszeres kitakarású kockák — ellenőrzéshez.
        if len(boxes) != 1:
            print(f"  kocka {i:03d} ({vid} {t} s): {len(boxes)} kitakarás")
        for size, w in WT_SIZES.items():
            h = round(crop.height * w / crop.width)
            out = crop.resize((w, h), Image.LANCZOS)
            path = os.path.join(OUT_W, size, f"f-{i:03d}.webp")
            out.save(path, "WEBP", quality=WT_QUALITY[size], method=6)
            totals[size] += os.path.getsize(path)
    n = len(webtrader_frames())
    print("webtrader frames", n, "avatar-kitakarás", masked_n, "bytes", totals)
    write_manifest()


def build_mobiltrader(src_dir: str) -> None:
    os.makedirs(OUT_M, exist_ok=True)
    gif = Image.open(os.path.join(src_dir, "13112.gif"))
    entries = []
    total = 0
    for src in M_FRAMES:
        gif.seek(src)
        frame = gif.convert("RGB")
        path = os.path.join(OUT_M, f"f-{src:03d}.webp")
        frame.save(path, "WEBP", quality=80, method=6)
        total += os.path.getsize(path)
        entries.append(src)
    print("mobiltrader frames", len(entries), "bytes", total, "size", gif.size)
    write_manifest()


def write_manifest() -> None:
    ts = os.path.join(ROOT, "src", "content", "trading-platforms-frames.ts")
    with open(ts, "w", encoding="utf-8") as fh:
        fh.write("/*\n * GENERÁLT FÁJL — scripts/trading-platforms/build-assets.py.\n")
        fh.write(" * MOBILTRADER_FRAMES: a K&H mobiltrader „értékpapírok\" GIF (13112.gif)\n")
        fh.write(" * kiválasztott képkockái: [forrás-sorszám, görgetési előrehaladás 0–1].\n")
        fh.write(" * WEBTRADER_FRAMES: a K&H webtrader 2.0 négy oktatóvideójából kivágott\n")
        fh.write(" * képkockák: [forrás-videó-id, idő mp-ben, görgetési előrehaladás 0–1];\n")
        fh.write(" * a fájl neve a tömbbeli sorszám (webtrader/{1280,760}/f-###.webp).\n */\n")
        fh.write("export const MOBILTRADER_FRAMES: readonly (readonly [number, number])[] = [\n")
        for src, p in frame_progress():
            fh.write(f"  [{src}, {p}],\n")
        fh.write("];\n\n")
        fh.write("export const WEBTRADER_FRAMES: readonly (readonly [string, number, number])[] = [\n")
        for vid, t, p in webtrader_frames():
            fh.write(f"  [\"{vid}\", {t}, {p}],\n")
        fh.write("];\n\n")
        fh.write("export const MOBILTRADER_SIZE = { width: 376, height: 834 } as const;\n")
        fh.write(f"export const WEBTRADER_SIZE = {{ width: {WT_SIZE[0]}, height: {WT_SIZE[1]} }} as const;\n")
    print(ts)


def main(argv: list) -> None:
    if argv == ["--manifest-only"]:
        # Csak a görgetési manifeszt újragenerálása (forrásfájlok és
        # képújrakódolás nélkül).
        write_manifest()
    elif len(argv) == 2 and argv[0] == "--webtrader":
        build_webtrader(argv[1])
    elif len(argv) == 2 and argv[0] == "--mobiltrader":
        build_mobiltrader(argv[1])
    elif len(argv) == 1 and not argv[0].startswith("--"):
        build_mobiltrader(argv[0])
        build_webtrader(argv[0])
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
