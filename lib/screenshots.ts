/**
 * The screenshot shot list (screenshots/shots.json) and the pure logic around it.
 * Used by scripts/screenshots/capture.ts and import.ts, and unit tested.
 * Kept free of path aliases so Node can run the scripts directly.
 */

export type Device = "desktop" | "phone";

export interface Shot {
  file: string;
  path?: string;
  device: Device;
  alt: string;
  caption?: string;
  /** Capture the whole scrolling page instead of one screen. */
  fullPage?: boolean;
  /**
   * Capture just one panel: the region (a <section> with a heading or aria-label) with this
   * accessible name, e.g. "Fleet map". Scrolled into view first.
   */
  section?: string;
  /** Click this selector before capturing, e.g. to open the first item in a list. */
  click?: string;
}

export interface AppShots {
  baseUrl: string;
  signIn: boolean;
  /** Captured by hand (e.g. Unity); the capture script skips these. */
  manual?: boolean;
  vars?: Record<string, string>;
  note?: string;
  shots: Shot[];
}

export interface ShotList {
  apps: Record<string, AppShots>;
}

export const VIEWPORTS: Record<Device, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 },
};

/** Captures are taken at 2x; anything wider than this is scaled down on import. */
export const MAX_WIDTH: Record<Device, number> = { desktop: 2400, phone: 780 };

const FILE_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Every problem in a shot list, as readable sentences. Empty means it's valid. */
export function shotListProblems(list: ShotList): string[] {
  const problems: string[] = [];
  for (const [slug, app] of Object.entries(list.apps)) {
    const seen = new Set<string>();
    for (const shot of app.shots) {
      const where = `${slug}/${shot.file}`;
      if (!FILE_NAME.test(shot.file))
        problems.push(`${where}: file names use lowercase letters, numbers and hyphens.`);
      if (seen.has(shot.file)) problems.push(`${where}: this file name is used twice.`);
      seen.add(shot.file);
      if (!(shot.device in VIEWPORTS))
        problems.push(`${where}: device must be "desktop" or "phone".`);
      if (!app.manual && !shot.path?.startsWith("/"))
        problems.push(`${where}: path must start with "/".`);
      if (shot.section !== undefined && !shot.section.trim())
        problems.push(`${where}: section can't be empty.`);
      if (shot.section && shot.fullPage)
        problems.push(`${where}: use section or fullPage, not both.`);
    }
  }
  return problems;
}

/** Alt text is required before a screenshot can be published. */
export function missingAlt(slug: string, shot: Shot): string | null {
  return shot.alt.trim()
    ? null
    : `${slug}/${shot.file}: write alt text for this shot in screenshots/shots.json before importing it.`;
}

/** Fills {placeholders} in a path from the app's vars. Throws if one isn't set. */
export function resolvePath(path: string, vars: Record<string, string> = {}): string {
  return path.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = vars[name]?.trim();
    if (!value) throw new Error(`Set vars.${name} in screenshots/shots.json to capture ${path}.`);
    return encodeURIComponent(value);
  });
}

/** Joins a base URL and a path without doubling or dropping the slash. */
export function shotUrl(baseUrl: string, path: string): string {
  if (!baseUrl.trim()) throw new Error("Set baseUrl in screenshots/shots.json first.");
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

/** Width to store an image at: never enlarged, capped per device. */
export function outputWidth(device: Device, sourceWidth: number): number {
  return Math.min(sourceWidth, MAX_WIDTH[device]);
}

/**
 * Name swaps as [real, demo] pairs, longest names first so "Ann Lee" is replaced before "Ann".
 * Blank names are dropped. The capture script applies these in the page, so real names
 * never reach an image.
 */
export function redactionPairs(swaps: Record<string, string>): Array<[string, string]> {
  return Object.entries(swaps)
    .filter(([from]) => from.trim())
    .sort(([a], [b]) => b.length - a.length);
}

/** Applies redaction pairs to text, the same way the page-side swap does. */
export function applyRedactions(text: string, pairs: Array<[string, string]>): string {
  return pairs.reduce((t, [from, to]) => t.split(from).join(to), text);
}
