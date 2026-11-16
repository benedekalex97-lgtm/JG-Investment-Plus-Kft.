"""
Kereskedési felületek — forrásanyag-feldolgozás (JG Investment Plus).

A végső, optimalizált asseteket állítja elő a hivatalos K&H forrásokból.
Az eredeti (nagy) források NEM részei a repositorynak; lásd
docs/trading-platforms-sources.md a letöltési URL-ekért és a döntésekért.

Használat (Pillow szükséges):
    python3 -I scripts/trading-platforms/build-assets.py <forrásmappa>

A forrásmappában ezeknek kell lenniük:
    13112.gif                    K&H mobiltrader — „értékpapírok" GIF
    pqAbdMKSSvM_maxres2.jpg      K&H webtrader — portfólió (YouTube-bélyegkocka)
    v_AP_bpaKkI_maxres2.jpg      K&H webtrader — OTP Bank részletek

Kimenet:
    public/trading-platforms/webtrader-*.webp
    public/trading-platforms/mobiltrader/f-###.webp
    src/content/trading-platforms-frames.ts  (a képkocka-manifeszt)
"""

import os
import sys

from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public", "trading-platforms")
OUT_M = os.path.join(OUT, "mobiltrader")

# --- Webtrader ---------------------------------------------------------------
# A böngészőablak tetejét (címsor) megtartjuk — valódi forrásrész, és mutatja,
# hogy böngészős felületről van szó. A Windows-tálcát (y >= 687) és a jobb
# szélső görgetősávot (x >= 1268) levágjuk. A jobb felső „TA" monogramos
# felhasználói avatart végleges pixelezéssel kitakarjuk.
WT_CROP = (0, 0, 1268, 686)
AVATAR_BOX = (1220, 72, 1264, 116)
WT_SOURCES = {
    "webtrader-portfolio": "pqAbdMKSSvM_maxres2.jpg",
    "webtrader-otp-detail": "v_AP_bpaKkI_maxres2.jpg",
}
WT_WIDTHS = (1268, 760)

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

# Történeti szakaszok: (görgetési előrehaladás tartomány) ← (forráskocka tartomány)
PHASES = [
    ((0.00, 0.16), (0, 21)),  # áttekintés: portfólióérték + kedvencek
    ((0.16, 0.38), (22, 116)),  # keresés, „tesla" begépelése, kiválasztás
    ((0.38, 0.64), (117, 171)),  # adatlap megnyílik, grafikon betölt
    ((0.64, 0.90), (172, 185)),  # görgetés a Teljesítmény-adatokig
]


def progress_for(src: int) -> float:
    for (p0, p1), (f0, f1) in PHASES:
        if f0 <= src <= f1:
            if f1 == f0:
                return p0
            return round(p0 + (p1 - p0) * (src - f0) / (f1 - f0), 4)
    raise ValueError(src)


def pixelate(im: Image.Image, box) -> Image.Image:
    region = im.crop(box)
    w, h = region.size
    region = region.resize((max(1, w // 11), max(1, h // 11)), Image.BILINEAR)
    region = region.resize((w, h), Image.NEAREST).filter(ImageFilter.GaussianBlur(2))
    im.paste(region, box)
    return im


def main(src_dir: str) -> None:
    os.makedirs(OUT_M, exist_ok=True)

    for name, fname in WT_SOURCES.items():
        im = Image.open(os.path.join(src_dir, fname)).convert("RGB")
        im = pixelate(im, AVATAR_BOX).crop(WT_CROP)
        for w in WT_WIDTHS:
            h = round(im.height * w / im.width)
            out = im if w == im.width else im.resize((w, h), Image.LANCZOS)
            path = os.path.join(OUT, f"{name}-{w}.webp")
            out.save(path, "WEBP", quality=86 if w > 1000 else 82, method=6)
            print(path, out.size, os.path.getsize(path))

    gif = Image.open(os.path.join(src_dir, "13112.gif"))
    entries = []
    total = 0
    for src in M_FRAMES:
        gif.seek(src)
        frame = gif.convert("RGB")
        path = os.path.join(OUT_M, f"f-{src:03d}.webp")
        frame.save(path, "WEBP", quality=80, method=6)
        total += os.path.getsize(path)
        entries.append((src, progress_for(src)))
    print("mobiltrader frames", len(entries), "bytes", total, "size", gif.size)

    ts = os.path.join(ROOT, "src", "content", "trading-platforms-frames.ts")
    with open(ts, "w", encoding="utf-8") as fh:
        fh.write("/*\n * GENERÁLT FÁJL — scripts/trading-platforms/build-assets.py.\n")
        fh.write(" * A K&H mobiltrader „értékpapírok\" GIF (13112.gif) kiválasztott\n")
        fh.write(" * képkockái: [forrás-sorszám, görgetési előrehaladás 0–1].\n */\n")
        fh.write("export const MOBILTRADER_FRAMES: readonly (readonly [number, number])[] = [\n")
        for src, p in entries:
            fh.write(f"  [{src}, {p}],\n")
        fh.write("];\n\n")
        fh.write(f"export const MOBILTRADER_SIZE = {{ width: {gif.size[0]}, height: {gif.size[1]} }} as const;\n")
        fh.write(f"export const WEBTRADER_SIZE = {{ width: {WT_CROP[2] - WT_CROP[0]}, height: {WT_CROP[3] - WT_CROP[1]} }} as const;\n")
    print(ts)


if __name__ == "__main__":
    main(sys.argv[1])
