"use client";

import { consent } from "@/content/consent";
import { openConsentSettings } from "@/lib/consent";

/** Lábléc: a sütihozzájárulás bármikori módosítása (újranyitja a sávot). */
export default function ConsentSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      {consent.settingsLabel}
    </button>
  );
}
