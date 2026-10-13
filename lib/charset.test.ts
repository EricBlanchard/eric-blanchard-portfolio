import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import { site, studio } from "@/content/site";
import { isSupportedChar, unsupportedChars } from "./charset";

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

function files(dir: string, ext: RegExp): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path, ext);
    return ext.test(name) && !/\.(test|stories)\./.test(name) ? [path] : [];
  });
}

describe("charset", () => {
  it("accepts ASCII and the typographic extras", () => {
    for (const c of ["a", "Z", "0", "~", "’", "–", "©", " "]) expect(isSupportedChar(c)).toBe(true);
  });

  it("rejects characters the fonts don't contain", () => {
    expect(unsupportedChars("café → ok é")).toEqual(["é", "→"]);
  });

  it("covers every string in the site content", () => {
    const text = strings([projects, site, studio]).join("\n");
    expect(unsupportedChars(text)).toEqual([]);
  });

  it("covers the copy written directly in pages and components", () => {
    const sources = [...files("app", /\.tsx$/), ...files("components", /\.tsx$/)];
    for (const path of sources) {
      expect(unsupportedChars(readFileSync(path, "utf8")), path).toEqual([]);
    }
  });
});
