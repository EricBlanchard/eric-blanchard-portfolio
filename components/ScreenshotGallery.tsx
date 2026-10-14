import Image from "next/image";
import type { Screenshot } from "@/content/types";

/** Desktop captures are taken at 2x, so an image's CSS size is half its pixel size. */
const NATURAL_SCALE = 2;
/** Phones are about this wide in CSS px, which tells a 1x, 2x or 3x phone capture apart. */
const PHONE_CSS = 390;

/** The size a screenshot was on screen, in CSS px; it is never shown larger than this. */
export function cssWidth(shot: Pick<Screenshot, "width" | "device">): number {
  const scale =
    shot.device === "phone" ? Math.max(1, Math.round(shot.width / PHONE_CSS)) : NATURAL_SCALE;
  return shot.width / scale;
}
/** Desktop shots narrower than this (in CSS px) are half-width panels; they pair up. */
const NARROW_CSS = 800;

type Group = { kind: "wide"; shot: Screenshot } | { kind: "narrow"; shots: Screenshot[] };

/** Consecutive narrow desktop shots share a row; wide ones get their own. */
export function groupDesktopShots(shots: readonly Screenshot[]): Group[] {
  const groups: Group[] = [];
  for (const shot of shots) {
    const narrow = shot.width / NATURAL_SCALE < NARROW_CSS;
    const last = groups.at(-1);
    if (!narrow) groups.push({ kind: "wide", shot });
    else if (last?.kind === "narrow" && last.shots.length < 2) last.shots.push(shot);
    else groups.push({ kind: "narrow", shots: [shot] });
  }
  return groups;
}

/**
 * Columns for the phone grid on wide screens: 4 or 3, whichever leaves the fuller last row
 * (5 phones sit 3 + 2, not 4 + 1). Ties go to 4.
 */
export function phoneColumns(count: number): 3 | 4 {
  const fill = (cols: number) => (((count - 1) % cols) + 1) / cols;
  return count > 0 && fill(3) > fill(4) ? 3 : 4;
}

function Shot({ shot, sizes }: { shot: Screenshot; sizes: string }) {
  return (
    // Never shown larger than it was captured, so text stays the size it was on screen.
    <figure className="flex flex-col gap-2" style={{ maxWidth: cssWidth(shot) }}>
      <Image
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        sizes={sizes}
        className="h-auto w-full rounded-md border border-line"
      />
      {shot.caption && <figcaption className="text-sm text-muted">{shot.caption}</figcaption>}
    </figure>
  );
}

/**
 * Wide desktop screenshots get a row each, half-width panels sit in pairs, and phone
 * screenshots sit side by side at the end.
 */
export function ScreenshotGallery({ shots }: { shots: readonly Screenshot[] }) {
  if (shots.length === 0) return null;
  const phones = shots.filter((s) => s.device === "phone");
  const groups = groupDesktopShots(shots.filter((s) => s.device !== "phone"));
  const columns = phoneColumns(phones.length);
  return (
    <div className="flex flex-col gap-12">
      {groups.map((group) =>
        group.kind === "wide" ? (
          <Shot key={group.shot.src} shot={group.shot} sizes="(min-width: 1248px) 1184px, 100vw" />
        ) : (
          <div key={group.shots[0]!.src} className="grid gap-12 md:grid-cols-2">
            {group.shots.map((shot) => (
              <Shot key={shot.src} shot={shot} sizes="(min-width: 768px) 50vw, 100vw" />
            ))}
          </div>
        ),
      )}
      {phones.length > 0 && (
        <div
          className={`grid grid-cols-2 gap-6 sm:grid-cols-3 ${columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
        >
          {phones.map((shot) => (
            <Shot
              key={shot.src}
              shot={shot}
              sizes={`(min-width: 1024px) ${columns === 3 ? 380 : 280}px, (min-width: 640px) 33vw, 50vw`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
