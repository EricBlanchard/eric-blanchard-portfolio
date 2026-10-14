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
  /** Window width in CSS pixels, for panels whose tables need more room than the default. */
  width?: number;
  /**
   * The image in screenshots/inbox/ to import, for shots taken by hand,
   * e.g. "steps/mobile/03-contest-leaderboard.png". Without it, the import looks for
   * an image named after `file` in the app's folders.
   */
  source?: string;
}

export interface AppShots {
  baseUrl: string;
  signIn: boolean;
  /** Captured by hand (e.g. Unity); the capture script skips these. */
  manual?: boolean;
  vars?: Record<string, string>;
  note?: string;
  /** Other inbox folder names for this app, e.g. ["steps"] for step-contest. */
  folders?: string[];
  /** Inbox images (paths inside screenshots/inbox/) never to import, e.g. private screens. */
  skip?: string[];
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
const IMAGE = /\.(png|jpe?g|webp)$/i;
/** A relative image path with no "..", no leading slash and no backslashes. */
const INBOX_PATH = /^(?!.*(^|\/)\.\.(\/|$))[^/\\][^\\]*\.(png|jpe?g|webp)$/i;

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
      if (!app.manual && !shot.source && !shot.path?.startsWith("/"))
        problems.push(`${where}: path must start with "/".`);
      if (shot.source !== undefined && !INBOX_PATH.test(shot.source))
        problems.push(
          `${where}: source must be an image path inside screenshots/inbox/, like "steps/mobile/01-home.png".`,
        );
      if (shot.section !== undefined && !shot.section.trim())
        problems.push(`${where}: section can't be empty.`);
      if (shot.section && shot.fullPage)
        problems.push(`${where}: use section or fullPage, not both.`);
      if (
        shot.width !== undefined &&
        !(Number.isInteger(shot.width) && shot.width >= 320 && shot.width <= 3840)
      )
        problems.push(`${where}: width must be a whole number of pixels from 320 to 3840.`);
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

/** The window size for a shot: the device's, with an optional wider (or narrower) width. */
export function viewportFor(shot: Pick<Shot, "device" | "width">): {
  width: number;
  height: number;
} {
  return { ...VIEWPORTS[shot.device], ...(shot.width ? { width: shot.width } : {}) };
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

/* ---------------------------------------------------------------------------------------
 * The inbox: images saved by hand into screenshots/inbox/, in any folder layout.
 * ------------------------------------------------------------------------------------- */

export interface InboxImage {
  /** Path inside screenshots/inbox/, with forward slashes. */
  path: string;
  width: number;
  height: number;
}

/** Folder names that say which device a screenshot came from. */
const DEVICE_FOLDERS: Record<string, Device> = {
  desktop: "desktop",
  laptop: "desktop",
  mobile: "phone",
  phone: "phone",
};

/**
 * Reads what an inbox path says about an image: the app folder it's in, its order
 * ("03-leaderboard" sorts third), a clean file name, and a device if a folder names one.
 */
export function parseInboxPath(path: string): {
  folder: string;
  order: number | null;
  name: string;
  device: Device | null;
} {
  const parts = path.split("/");
  const folder = parts[0]!.toLowerCase();
  const base = parts[parts.length - 1]!.replace(IMAGE, "");
  const match = /^(\d+)[a-z]?[-_ ]+(.*)$/i.exec(base);
  const order = match ? Number(match[1]) : null;
  const name = slugify(match ? match[2]! : base) || "shot";
  const device =
    parts
      .slice(1, -1)
      .map((p) => DEVICE_FOLDERS[p.toLowerCase()])
      .find(Boolean) ?? null;
  return { folder, order, name, device };
}

/** Lowercase letters, numbers and hyphens, as shot file names require. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The device for an image: the folder's word for it if there is one, otherwise its width.
 * Phone captures (at 2x or 3x) are under ~1300 px wide; desktop captures are wider.
 */
export function inferDevice(hint: Device | null, width: number): Device {
  return hint ?? (width > 0 && width < 1300 ? "phone" : "desktop");
}

export interface InboxPlan {
  /** "<slug>/<file>" → the inbox image to import for that shot. */
  sources: Map<string, string>;
  /** New shots for images that aren't in the shot list yet, per app, already in order. */
  added: Record<string, Shot[]>;
  /** Images in folders that don't belong to any app. */
  unknown: string[];
}

/**
 * Matches inbox images to the shot list. A shot uses its `source` if given, otherwise an
 * image in one of its app's folders named after it ("leaderboard.png" or "03-leaderboard.png").
 * Every other image in an app's folders becomes a new shot, sorted by folder and number,
 * with empty alt text so nothing is published until someone describes it.
 */
export function planInbox(list: ShotList, images: InboxImage[]): InboxPlan {
  const sources = new Map<string, string>();
  const added: Record<string, Shot[]> = {};
  const unknown: string[] = [];

  const appFor = new Map<string, string>();
  for (const [slug, app] of Object.entries(list.apps)) {
    for (const folder of [slug, ...(app.folders ?? [])]) appFor.set(folder.toLowerCase(), slug);
  }

  const used = new Set<string>();
  const byApp = new Map<string, InboxImage[]>();
  for (const image of images) {
    const slug = appFor.get(parseInboxPath(image.path).folder);
    if (!slug) {
      unknown.push(image.path);
      continue;
    }
    byApp.set(slug, [...(byApp.get(slug) ?? []), image]);
  }

  for (const [slug, app] of Object.entries(list.apps)) {
    const pool = byApp.get(slug) ?? [];
    for (const shot of app.shots) {
      const image = shot.source
        ? pool.find((i) => i.path === shot.source)
        : pool.find((i) => !used.has(i.path) && parseInboxPath(i.path).name === shot.file);
      if (image) {
        sources.set(`${slug}/${shot.file}`, image.path);
        used.add(image.path);
      }
    }

    const skip = new Set(app.skip ?? []);
    const listedSources = new Set(app.shots.map((s) => s.source).filter(Boolean));
    const fresh = pool
      .filter((i) => !used.has(i.path) && !skip.has(i.path) && !listedSources.has(i.path))
      .sort(compareInbox);
    const taken = new Set(app.shots.map((s) => s.file));
    for (const image of fresh) {
      const { name, device: hint } = parseInboxPath(image.path);
      const device = inferDevice(hint, image.width);
      let file = name;
      if (taken.has(file) && device === "phone") file = `${name}-phone`;
      for (let n = 2; taken.has(file); n++) file = `${name}-${n}`;
      taken.add(file);
      (added[slug] ??= []).push({ file, source: image.path, device, alt: "", caption: "" });
    }
  }
  return { sources, added, unknown: unknown.sort() };
}

/** Folder first, then the number at the front of the name, then the name. */
function compareInbox(a: InboxImage, b: InboxImage): number {
  const dir = (p: string) => p.slice(0, p.lastIndexOf("/") + 1);
  if (dir(a.path) !== dir(b.path)) return dir(a.path) < dir(b.path) ? -1 : 1;
  const pa = parseInboxPath(a.path);
  const pb = parseInboxPath(b.path);
  const oa = pa.order ?? Number.POSITIVE_INFINITY;
  const ob = pb.order ?? Number.POSITIVE_INFINITY;
  if (oa !== ob) return oa - ob;
  return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
}
