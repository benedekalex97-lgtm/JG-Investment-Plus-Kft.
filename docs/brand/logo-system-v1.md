# JG Investment Plus — Logo System v1.0

Status: **implementation v1.0 on `feature/jg-logo-system-v1`, not merged or deployed yet.**
Visual reference: *JG Investment Plus — Logo Validation v0.8* (AI-generated art-direction board).
The board is an art-direction reference only. It is **not** a vector master, and the geometry
below was reconstructed from scratch rather than traced.

Legend used throughout this document:

| Tag | Meaning |
| --- | --- |
| **[APPROVED]** | An existing decision that this implementation must not change |
| **[IMPLEMENTATION]** | A decision made while building v1.0, within the approved constraints |
| **[RECOMMENDATION]** | Suggested practice, not yet binding |
| **[ALEX APPROVAL REQUIRED]** | Still open, and needs sign-off before production |

---

## 1. Brand Mark Overview

**[APPROVED]** The JG brand mark is an abstract, **non-letter** symbol: the "Symmetric Core"
direction (lineage B1 → B1b Open Framework → B1b-1 → B1b-1a → B1b-1a1 Core Mark → Symmetric
Core → Logo Validation v0.8). J/G monograms were rejected and are not part of the system.

The symbol has four parts:

1. one centred upper cap
2. one left structural pillar
3. one right structural pillar
4. a centred, open negative-space aperture between the pillars

The mark is abstract. It is not meant to depict a building, house, doorway, cube, tower or
architecture icon, and it should not be illustrated or explained as one.

## 2. Concept Rationale

**[APPROVED]** The logo expresses *professional order + human relationship*:

- **Upper cap:** framework, unity, professional structure.
- **Pillars:** stability, support, professional background.
- **Open central space:** transparency, access, openness, connection.

These ideas are carried by proportion and restraint, not by literal imagery. The mark does
not attempt to say "investment". It deliberately avoids charts, arrows, coins, currency signs,
shields, crowns, animals, heraldry and network nodes.

Compliance note: the mark must never be described as representing guaranteed safety,
guaranteed return, growth, or capital protection. Permitted rationale words are: stability,
structure, clarity, transparency, support, framework, connection, openness.

## 3. Geometry

**[IMPLEMENTATION]** The mark is built on an integer grid of **88 × 99 units**, with a
**module m = 8 units**. Every edge is either vertical or has a **1 : 2 slope** (26.565°). No
curves, no Béziers, no optical fudging.

| Element | Size (units) | Size (modules) |
| --- | --- | --- |
| Overall width | 88 | 11m |
| Overall height | 99 | 12.375m |
| Upper cap (rhombus) width × height | 72 × 36 | 9m × 4.5m |
| Cap inset from outer edge | 8 | 1m |
| Pillar width | 32 | 4m |
| Pillar outer-edge height | 76 | 9.5m |
| Pillar inner-edge height | 44 | 5.5m |
| Pillar top / bottom edge slope | 1 : 2 | parallel to the cap's lower edges |
| Cap → pillar gap (vertical) | 9 | 1.125m (≈ 1m measured perpendicular) |
| **Central aperture width = X** | **24** | **3m** |
| Aperture | open at the bottom | — |

Canonical vertices (viewBox `0 0 88 99`, x-axis to the right, y-axis down):

```
Upper cap     (44,0)  (80,18) (44,36) (8,18)
Left pillar   (0,23)  (32,39) (32,83) (0,99)
Right pillar  (88,23) (56,39) (56,83) (88,99)
```

SVG path (the single source for code):

```
M44 0 80 18 44 36 8 18Z M0 23 32 39 32 83 0 99Z M88 23 56 39 56 83 88 99Z
```

The same string appears in `src/components/Logo.tsx` (`JG_MARK_PATH`) and in
`public/brand/*.svg`. **If you change it in one place, change it in all of them.**

Proportions checked against the v0.8 board: cap width is 81.8% of the overall width (board
≈ 82%), pillar width 36.4% (≈ 36%), aperture 27.3% (≈ 27%), height/width ratio 1.125
(≈ 1.13).

## 4. Symmetry

**[APPROVED — hard constraint]** The mark is exactly symmetric about the vertical axis
**x = 44**.

- The right pillar is the left pillar mirrored with x → 88 − x: (0,23)↔(88,23),
  (32,39)↔(56,39), (32,83)↔(56,83), (0,99)↔(88,99).
- The pillars have identical width (32), heights (76 / 44), slopes and area.
- The cap's top and bottom vertices lie on x = 44, and its side vertices sit at 8 and 80
  (44 ∓ 36).
- The aperture spans 32 → 56, centred on x = 44.
- Each pillar is also symmetric about its own horizontal midline, y = 61.

**Optical corrections: none.** At every tested size (16–128 px) the mathematically symmetric
mark reads as balanced, so no optical correction was needed. No deviation from symmetry is
proposed.

## 5. Logo Variants

**[IMPLEMENTATION]** Component: `src/components/Logo.tsx`

```tsx
<Logo variant="mark" theme="light" className="h-8" />          // symbol only, role="img", aria-label="JG Investment Plus"
<Logo variant="mark" theme="dark" decorative className="h-6" /> // symbol only, aria-hidden (when a name is already visible)
<Logo variant="horizontal" theme="dark" className="text-sm" />  // symbol + wordmark in one row
<Logo variant="stacked" theme="light" className="text-base" />  // symbol above a centred wordmark
```

| Variant | Mark height | Mark → wordmark gap | Use |
| --- | --- | --- | --- |
| `mark` | set by `className` (default `h-8`) | — | favicon-like contexts, avatars, tight UI |
| `horizontal` | 2.5em | 1.25X (0.76em) | header, footer, most web use |
| `stacked` | 3.5em | 1X (0.85em) | centred or square layouts (documents, social cards) |

Lockups scale with `font-size`: set a single `text-*` class and the mark, gap and wordmark
stay in proportion. The `theme` prop describes the **background context**, not the colour of
the mark (see §6).

Accessibility:

- In lockups, the SVG is `aria-hidden` and the accessible name comes from the live wordmark
  text, so it is announced once.
- The DOM text is the mixed-case `JG Investment Plus` (`meta.wordmark`). Uppercase is applied
  with CSS, so screen readers do not spell it letter by letter.
- The standalone `mark` gets `role="img"` and `aria-label="JG Investment Plus"`, unless it is
  marked `decorative`.
- The optional `wordmarkClassName` prop lets the wordmark be visually hidden (`sr-only`) at
  some breakpoints while keeping the accessible name (the header uses this, see §12).

## 6. Color Usage

**[APPROVED]** Palette: Graphite × Aubergine × Silver. Tokens live in `src/app/globals.css`.

| Application | Mark / wordmark | Background | Contrast | `theme` |
| --- | --- | --- | --- | --- |
| **Primary** | Carbon `#18181B` | Porcelain `#F4F3F1` | 15.98 : 1 | `light` |
| **Primary inverse** | Porcelain `#F4F3F1` | Carbon `#18181B` (and the site's deep/sink surfaces) | 15.98 : 1 (16.85 : 1 on sink) | `dark` |
| **Secondary** | Aubergine `#493447` | Porcelain `#F4F3F1` | 10.15 : 1 | `aubergine` |
| Restricted | Cool Silver `#BEC1C7` | Carbon `#18181B` only | 9.82 : 1 | not a component theme; static asset use only |

The mark uses `currentColor`, so one colour class on the root controls both the mark and the
wordmark. No colour variants are hard-coded beyond the two static SVG files.

Not permitted as logo colours:

- **Signal Berry `#8E3F67`**: an accent colour, never the logo colour.
- **Cool Silver on light backgrounds**: 1.63 : 1, fails contrast.
- **Muted Plum**: no brand role for the logo.
- **Gold, metallic, chrome, or any gradient.**

## 7. Wordmark

**[IMPLEMENTATION]** The wordmark is **live HTML text**, not an outlined vector.

| Property | Value |
| --- | --- |
| Text | `JG Investment Plus` (from `meta.wordmark`), rendered uppercase with CSS |
| Font | Inter (the site's approved UI font, via `next/font`) |
| Weight | 500 (Medium) |
| Tracking | 0.12em, with a trailing −0.12em margin so the tracked text is not optically off-centre |
| Line height | 1, which puts Inter's cap-height centre exactly at the mark's centre in the horizontal lockup |

Rationale: medium weight holds up at 11–15 px on dark surfaces without looking bold. 0.12em
tracking gives a calm, institutional rhythm and avoids the exaggerated tracking of
fashion-luxury marks. The wordmark explorations on the v0.8 board (A/B/C) were used as
direction only.

**Important:** no outlined, proprietary vector wordmark exists yet, and none has been faked.
Until one is drawn and approved, the lockup is the SVG mark plus real text in the approved
font system. **[RECOMMENDATION]** Commission a dedicated outlined wordmark master
(kerning-tuned) before print, signage or any use outside the website.

## 8. Clear Space

**[IMPLEMENTATION]** Let **X = the width of the central aperture** (24 units, which is 24/99
≈ 0.24 of the mark height).

- Keep at least **1X** of clear space on every side of the mark or lockup. No text, imagery,
  edges or other logos may enter this zone.
- Inside the horizontal lockup, the mark-to-wordmark gap is **1.25X**. In the stacked lockup
  it is **1X**.

Example: a 36 px mark has X ≈ 8.7 px, so it needs ≥ 9 px of clear space all round.

## 9. Minimum Size

**[IMPLEMENTATION]**

| Asset | Minimum |
| --- | --- |
| Master mark (screen) | **24 px** tall |
| Horizontal lockup (screen) | wordmark **11 px** font size (the mark is then 27.5 px) |
| Below 24 px | use the **micro mark** only (favicon / app icon) |
| Print | **[RECOMMENDATION]** mark ≥ 8 mm tall; to be confirmed with the outlined wordmark master |

## 10. Favicon / Micro Mark

**[IMPLEMENTATION]** Small-size check of the master mark (rendered at 1×, Carbon on Porcelain
and Porcelain on Carbon):

| Size | Result |
| --- | --- |
| 16 px | Aperture visible, but the **cap/pillar gap closes to a grey anti-aliased line**. Needs the micro mark. |
| 24 px | All three parts read, and the gap is clear. OK. |
| 32 px | OK. |
| 48 px | OK. |
| 64 px | OK. |
| 128 px | OK; edges crisp. |

**Micro mark**, derived directly from the master and used only in `src/app/icon.svg`:

- **Change:** the cap/pillar gap is widened from **9 to 14 units** (vertical) by lowering each
  pillar's top edge 5 units. The top corners move from (0,23)/(32,39) to (0,28)/(32,44), and
  the right pillar is mirrored.
- **Unchanged:** cap, pillar width, aperture width, slopes, outer silhouette and symmetry.
- **Reason:** at 16 px the master gap is about 1 px and disappears; 14 units keeps the three
  parts distinct.

```
M44 0 80 18 44 36 8 18Z M0 28 32 44 32 83 0 99Z M88 28 56 44 56 83 88 99Z
```

The favicon is the micro mark in Porcelain on a Carbon rounded tile (32-unit viewBox, radius
7, the same tile style as the previous icon), with the mark 22 units tall. The tile keeps the
icon legible in both light and dark browser chrome. `src/app/apple-icon.png` (180 × 180) uses
the **master** mark on full-bleed Carbon, since iOS applies its own corner mask.

## 11. Incorrect Usage

Do not:

- stretch, squash or change the aspect ratio
- make any asymmetric modification (the pillars must stay mirror images)
- rotate arbitrarily or skew
- recolour outside §6
- apply gradients, glow, shadow, bevel, 3D or metallic effects
- produce a gold version
- rearrange, separate, add or remove elements
- distort, fill or narrow the aperture
- place the mark on backgrounds with insufficient contrast
- place detailed imagery or photography directly behind the mark without a calm surface
- outline the mark or add a keyline/box, other than the approved favicon tile
- recreate the wordmark in another typeface, or fake an outlined wordmark
- build K&H- or Patria-style co-brand lockups, or imitate their logos or colours
- use the mark to suggest guaranteed safety, return, growth or capital protection

## 12. Website Implementation

| Location | Implementation |
| --- | --- |
| Header (`src/components/Header.tsx`) | `horizontal`, `theme="dark"` (Porcelain on the dark header gradient). Text size is 11 px under 640 px, 13 px at 640–1023, 12.5 px at 1024–1279 and 14 px from 1280. **Below 375 px only the mark shows**; the wordmark stays `sr-only`, so the link's name is still "JG Investment Plus". |
| Mobile navigation | Same header bar, and the lockup is identical when the menu is open. The open-state "Bezárás" button (115 px) fits next to the lockup from 375 px, and next to the mark below that. |
| Footer (`src/components/Footer.tsx`) | `horizontal`, `theme="dark"`, 14 px (15 px from 1024). |
| Favicon | `src/app/icon.svg` (micro mark on Carbon tile) and `src/app/apple-icon.png`, both picked up by Next.js file conventions. |

The v1.4 Berry "signature rule" next to the old text wordmark was a placeholder, documented
in code as "not a logo". The mark replaces it, and its unused CSS class was removed. The
footer's short Berry divider line below the brand block is unchanged.

Why the header sizes differ at 1024–1279 px: the desktop nav needs 751 px and already wrapped
to two lines between 1024 and 1056 px **before** this change (a pre-existing issue). The
smaller lockup at that range (≈ 199 px, slightly narrower than the old 202 px text wordmark)
keeps the wrap point where it was instead of pushing it to 1083 px. The wrap itself is now
fixed separately: between 1024 and 1079 px the nav items and separator use 12 px instead of
16 px side padding, so the nav stays on one line at every width from 1024 px.

## 13. Production Assets

| File | Purpose |
| --- | --- |
| `public/brand/jg-mark.svg` | Master symbol, Carbon; standalone asset for documents and designers |
| `public/brand/jg-mark-inverse.svg` | Master symbol, Porcelain, for Carbon backgrounds |
| `src/components/Logo.tsx` | Reusable React logo system; inline SVG with `currentColor` |
| `src/app/icon.svg` | Favicon: micro mark on a Carbon tile |
| `src/app/apple-icon.png` | 180 × 180 Apple touch icon: master mark on Carbon |

There is no outlined wordmark asset yet (see §7).

## 14. Open decisions — [ALEX APPROVAL REQUIRED]

1. **Master geometry v1.0**: the grid proportions in §3 (cap 9m, pillars 4m, aperture 3m,
   gap 9 units, 1 : 2 slopes).
2. **Wordmark treatment**: Inter Medium, uppercase, 0.12em tracking, as live text.
3. **Header below 375 px shows the mark only**, instead of the full lockup.
4. **Micro mark** for the favicon (gap widened 9 → 14 units).
5. **Favicon tile**: Porcelain micro mark on a Carbon rounded tile.
6. **Commissioning an outlined wordmark master** before print or off-web use.
