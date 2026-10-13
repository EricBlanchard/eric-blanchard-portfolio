import localFont from "next/font/local";

/**
 * Self-hosted fonts (SIL Open Font License, see app/fonts/), subset to the characters
 * in lib/charset.ts by scripts/subset-fonts.py. Both together are under 30 kB.
 */
export const displayFace = localFont({
  src: "./fonts/BigShoulders-latin-800.woff2",
  variable: "--font-display-face",
  weight: "800",
  display: "swap",
  preload: true,
});

export const bodyFace = localFont({
  src: "./fonts/InstrumentSans-latin-wght.woff2",
  weight: "400 700",
  variable: "--font-body-face",
  // Body text should never repaint late: if the font misses the first ~100ms,
  // this visit keeps the metric-matched fallback and the next one uses the cached font.
  display: "optional",
  preload: true,
});

export const fontVariables = `${displayFace.variable} ${bodyFace.variable}`;
