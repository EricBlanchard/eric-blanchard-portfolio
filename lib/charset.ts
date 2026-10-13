/**
 * The characters the subset fonts contain (see scripts/subset-fonts.py).
 * Anything outside this set would render in a fallback font.
 */
const extras = " ©×–—‘’“”•…";

export function isSupportedChar(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  return (code >= 0x20 && code <= 0x7e) || extras.includes(char);
}

/** Characters in `text` the fonts can't render, deduplicated. */
export function unsupportedChars(text: string): string[] {
  return [...new Set([...text].filter((c) => c !== "\n" && !isSupportedChar(c)))];
}
