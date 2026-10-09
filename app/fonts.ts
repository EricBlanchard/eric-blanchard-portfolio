import localFont from "next/font/local";

/**
 * Self-hosted variable fonts (SIL Open Font License, see app/fonts/).
 * Self-hosting avoids a third-party request on first paint.
 */
export const displayFace = localFont({
  src: "./fonts/BigShoulders-latin-wght.woff2",
  variable: "--font-display-face",
  weight: "100 900",
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
