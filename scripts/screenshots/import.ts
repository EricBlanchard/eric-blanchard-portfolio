#!/usr/bin/env node
/**
 * Turns images in screenshots/inbox/ into optimized WebP files in public/work/<slug>/, and
 * writes content/screenshots.generated.ts, which the project pages read.
 *
 * The inbox can be laid out any way: a folder per app (or one of its `folders`, like
 * "steps"), with subfolders such as desktop/ and mobile/. Images that aren't in
 * screenshots/shots.json yet are added to it, ordered by folder and by the number at the
 * front of their names, with empty alt text. Only shots with alt text are imported, in the
 * order of shots.json. Image metadata (location, device) is stripped.
 *
 *   npm run screenshots:import
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import * as prettier from "prettier";
import sharp from "sharp";
import {
  missingAlt,
  outputWidth,
  planInbox,
  shotListProblems,
  type Device,
  type InboxImage,
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

const SHOTS = "screenshots/shots.json";
const INBOX = join("screenshots", "inbox");

const list = JSON.parse(readFileSync(SHOTS, "utf8")) as ShotList;
const problems = shotListProblems(list);
if (problems.length > 0) {
  console.error(`${SHOTS} has problems:\n  ` + problems.join("\n  "));
  process.exit(1);
}

/** Every image anywhere in the inbox, with its size. */
async function readInbox(dir: string): Promise<InboxImage[]> {
  if (!existsSync(dir)) return [];
  const images: InboxImage[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !/\.(png|jpe?g|webp)$/i.test(entry.name)) continue;
    const full = join(entry.parentPath, entry.name);
    const { width = 0, height = 0 } = await sharp(full).metadata();
    images.push({ path: relative(dir, full).split(sep).join("/"), width, height });
  }
  return images;
}

const plan = planInbox(list, await readInbox(INBOX));

// New images join the shot list, in order, waiting for alt text.
const newShots = Object.entries(plan.added);
if (newShots.length > 0) {
  for (const [slug, shots] of newShots) list.apps[slug]!.shots.push(...shots);
  const text = await prettier.format(JSON.stringify(list), { parser: "json" });
  writeFileSync(SHOTS, text);
  console.log(`Added to ${SHOTS} (write alt text for each, or list it in the app's "skip"):`);
  for (const [slug, shots] of newShots) {
    for (const shot of shots)
      console.log(`  ${slug}/${shot.file}  ←  ${shot.source}  (${shot.device})`);
  }
  console.log("");
}
if (plan.unknown.length > 0) {
  console.warn(
    "These images are in folders that don't match any app (add the folder name to that app's" +
      ` "folders" in ${SHOTS}):\n  ` +
      plan.unknown.join("\n  ") +
      "\n",
  );
}

const result: Record<string, Entry[]> = {};
const blocked: string[] = [];
let imported = 0;

for (const [slug, app] of Object.entries(list.apps)) {
  const entries: Entry[] = [];
  for (const shot of app.shots) {
    const found = plan.sources.get(`${slug}/${shot.file}`);
    const source = found ? join(INBOX, found) : undefined;
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
      console.log(`imported ${slug}/${shot.file}  ←  ${found}`);
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

  // Remove images for shots that are no longer in the list, so they don't ship unused.
  const dir = join("public", "work", slug);
  if (existsSync(dir)) {
    const listed = new Set(app.shots.map((shot) => `${shot.file}.webp`));
    for (const name of readdirSync(dir)) {
      if (name.endsWith(".webp") && !listed.has(name)) {
        rmSync(join(dir, name));
        console.log(`removed ${slug}/${name} (no longer in shots.json)`);
      }
    }
  }
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
