"use client";

import { useState } from "react";
import EmblemCanvas from "@/components/hero-3d/EmblemCanvas";
import { emblemAssets } from "./emblemAssets";

/**
 * HeroEmblem — a JG-embléma helye a hero saját kompozíciójában (v0.4).
 *
 * Fő látvány: valódi, böngészőben renderelt 3D-jelenet (ld. hero-3d). Az
 * egyetlen WebGL-canvas a <body> alatt, dokumentum-koordinátákban áll: a
 * nyitás a képernyő közepén kezdődik, és az embléma EBBE a slotba érkezik.
 * Nyugalomban az embléma áll (nincs idle mozgás, nincs szünet-gomb); egérre
 * finoman elfordul.
 *
 * Statikus tartalék: a JG_hero_3D_alap_v01 csomag renderelt PNG-rétegei
 * egymásra helyezve ([data-emblem-fallback]) és a render padlófénye. NEM
 * animál: JS nélkül, reduced-motionnél, WebGL- vagy modellhibánál és context
 * lossnál ez látszik. Amikor a 3D élő, a PNG-rétegek rejtve maradnak.
 *
 * A slot helyét és képarányát az elrendezés előre lefoglalja. Dekoratív:
 * aria-hidden.
 */
export default function HeroEmblem() {
  const [live, setLive] = useState(false);

  const { widths, sizes, layers, width, height, canvas, floorLight, floorRect } = emblemAssets;
  // A padlófény a render-vászon koordinátáiban áll: a vágott slothoz képest
  // ugyanott, ahol a renderben — így a regisztráció pontos.
  const floorStyle = {
    left: `${((floorRect.left - canvas.left) / width) * 100}%`,
    top: `${((floorRect.top - canvas.top) / height) * 100}%`,
    width: `${(floorRect.width / width) * 100}%`,
    height: `${(floorRect.height / height) * 100}%`,
  };

  return (
    <div className="hero-emblem-wrap" data-live={live ? "true" : undefined}>
      <div
        data-hero-emblem=""
        className="hero-emblem-slot"
        style={{ aspectRatio: `${width} / ${height}` }}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={floorLight}
          alt=""
          decoding="async"
          loading="lazy"
          draggable={false}
          className="hero-emblem-floor"
          style={floorStyle}
        />
        <div data-emblem-fallback="" className="hero-emblem-fallback">
          {layers.map((layer) => (
            // Előre méretezett, alfa-csatornás WebP-k; a regisztráció miatt
            // mindhárom réteg azonos dobozt és srcsetet kap.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={layer.role}
              src={`${layer.base}-${widths[widths.length - 1]}.webp`}
              srcSet={widths.map((w) => `${layer.base}-${w}.webp ${w}w`).join(", ")}
              sizes={sizes}
              width={width}
              height={height}
              alt=""
              decoding="async"
              draggable={false}
              className="hero-emblem-img"
            />
          ))}
        </div>
      </div>

      <EmblemCanvas onLiveChange={setLive} />
    </div>
  );
}
