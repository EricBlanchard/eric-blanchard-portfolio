#!/usr/bin/env node
/**
 * Turns screenshots/inbox/<slug>/<file>.(png|jpg|jpeg|webp) into optimized WebP files in
 * public/work/<slug>/, and writes content/screenshots.generated.ts, which the project
 * pages read. Only shots listed in screenshots/shots.json are imported, in that order,
 * and each needs alt text. Image metadata (location, device) is stripped.
 *
 *   npm run screenshots:import
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import {
  missingAlt,
  outputWidth,
  shotListProblems,
  type Device,
  type ShotList,
} from "../../lib/screenshots.ts";

interface Entry {
  src: string;
  alt: string;
  width: number;
  height: number;
  device: Device;
  caption?: string;
}

const list = JSON.parse(readFileSync("screenshots/shots.json", "utf8")) as ShotList;
const problems = shotListProblems(list);
if (problems.length > 0) {
  console.error("screenshots/shots.json has problems:\n  " + problems.join("\n  "));
  process.exit(1);
}

const result: Record<string, Entry[]> = {};
const blocked: string[] = [];
let imported = 0;

for (const [slug, app] of Object.entries(list.apps)) {
  const entries: Entry[] = [];
  for (const shot of app.shots) {
    const source = ["png", "jpg", "jpeg", "webp"]
      .map((ext) => join("screenshots", "inbox", slug, `${shot.file}.${ext}`))
      .find((p) => existsSync(p));
    const dest = join("public", "work", slug, `${shot.file}.webp`);
    const altProblem = missingAlt(slug, shot);

    if (source) {
      if (altProblem) {
        blocked.push(altProblem);
        continue;
      }
      mkdirSync(join("public", "work", slug), { recursive: true });
      const meta = await sharp(source).metadata();
      await sharp(source)
        .resize({ width: outputWidth(shot.device, meta.width ?? 0), withoutEnlargement: true })
        .webp({ quality: 82, effort: 6 })
        .toFile(dest);
      imported++;
      console.log(`imported ${slug}/${shot.file}`);
    }

    // Keep anything imported before, even if the inbox has been cleared since.
    if (existsSync(dest) && !altProblem) {
      const { width = 0, height = 0 } = await sharp(dest).metadata();
      entries.push({
        src: `/work/${slug}/${shot.file}.webp`,
        alt: shot.alt.trim(),
        width,
        height,
        device: shot.device,
        ...(shot.caption?.trim() ? { caption: shot.caption.trim() } : {}),
      });
    }
  }
  if (entries.length > 0) result[slug] = entries;
}

// A TypeScript module rather than JSON, so every tool (Next.js, Vite, Node, Playwright)
// imports it the same way.
writeFileSync(
  "content/screenshots.generated.ts",
  [
    "// Written by `npm run screenshots:import`. Edit screenshots/shots.json instead.",
    'import type { Screenshot } from "./types";',
    "",
    `export const generatedScreenshots: Record<string, Screenshot[]> = ${JSON.stringify(result, null, 2)};`,
    "",
  ].join("\n"),
);
console.log(`\n${imported} imported. content/screenshots.generated.ts updated.`);
if (blocked.length > 0) {
  console.error("\nNot imported:\n  " + blocked.join("\n  "));
  process.exitCode = 1;
}
