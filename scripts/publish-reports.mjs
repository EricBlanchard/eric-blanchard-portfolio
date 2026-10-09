#!/usr/bin/env node
/** Copies the HTML coverage report into public/ so the site can link to it. */
import { cpSync, existsSync, rmSync } from "node:fs";

const from = "coverage";
const to = "public/reports/coverage";
if (!existsSync(`${from}/index.html`)) {
  console.warn("publish-reports: no coverage report found, run `npm run test:ci` first");
  process.exit(0);
}
rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log(`publish-reports: copied ${from} to ${to}`);
