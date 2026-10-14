import { generatedScreenshots } from "./screenshots.generated";
import type { Screenshot } from "./types";

/** Screenshots imported by `npm run screenshots:import`, in shot-list order. */
export function screenshotsFor(slug: string): Screenshot[] {
  return generatedScreenshots[slug] ?? [];
}
