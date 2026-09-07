import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JG Investment Plus Kft. · A K&H Értékpapír függő ügynöke",
  description:
    "A JG Investment Plus Kft. a K&H Értékpapír (Patria Finance Magyarországi Fióktelepe) függő ügynöke. A tényleges befektetési szolgáltató a Fióktelep; a JG Investment Plus Kft. nem nyújt befektetési tanácsadást.",
  // v0.1 prototípus: nem publikálásra kész, ezért nem indexelhető.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // A 200%-os szövegnagyítás engedélyezett marad.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
