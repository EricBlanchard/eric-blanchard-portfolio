import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  missingAlt,
  outputWidth,
  applyRedactions,
  redactionPairs,
  resolvePath,
  shotListProblems,
  shotUrl,
  type ShotList,
} from "./screenshots";

const committed = JSON.parse(readFileSync("screenshots/shots.json", "utf8")) as ShotList;

describe("the committed shot list", () => {
  it("is valid", () => {
    expect(shotListProblems(committed)).toEqual([]);
  });

  it("never asks for the private Daric modules", () => {
    const paths = committed.apps.daric?.shots.map((s) => s.path) ?? [];
    expect(paths.some((p) => p?.startsWith("/people") || p?.startsWith("/weight"))).toBe(false);
  });

  it("captures Fleet Pulse panels with data, not page headers", () => {
    const shots = committed.apps["fleet-pulse"]?.shots ?? [];
    expect(shots.length).toBeGreaterThan(0);
    for (const shot of shots) expect(shot.section, shot.file).toBeTruthy();
  });

  it("keeps studio simulator captures to public pages", () => {
    expect(committed.apps["studio-simulator"]?.signIn).toBe(false);
  });
});

describe("shotListProblems", () => {
  const app = (shots: ShotList["apps"][string]["shots"], manual = false) => ({
    apps: { demo: { baseUrl: "", signIn: false, manual, shots } },
  });

  it("flags bad names, duplicates, devices and paths", () => {
    const problems = shotListProblems(
      app([
        { file: "Home Page", path: "/", device: "desktop", alt: "x" },
        { file: "a", path: "/", device: "desktop", alt: "x" },
        { file: "a", path: "/", device: "desktop", alt: "x" },
        { file: "b", path: "/", device: "tablet" as never, alt: "x" },
        { file: "c", path: "no-slash", device: "phone", alt: "x" },
      ]),
    );
    expect(problems).toHaveLength(4);
    expect(problems.join("\n")).toMatch(/lowercase/);
    expect(problems.join("\n")).toMatch(/used twice/);
    expect(problems.join("\n")).toMatch(/"desktop" or "phone"/);
    expect(problems.join("\n")).toMatch(/start with "\/"/);
  });

  it("rejects an empty section, and section with fullPage", () => {
    const problems = shotListProblems(
      app([
        { file: "a", path: "/", device: "desktop", alt: "x", section: " " },
        { file: "b", path: "/", device: "desktop", alt: "x", section: "Map", fullPage: true },
      ]),
    );
    expect(problems).toEqual([
      "demo/a: section can't be empty.",
      "demo/b: use section or fullPage, not both.",
    ]);
  });

  it("doesn't need paths for manual shots", () => {
    expect(shotListProblems(app([{ file: "world", device: "desktop", alt: "" }], true))).toEqual(
      [],
    );
  });
});

describe("missingAlt", () => {
  it("requires alt text", () => {
    expect(missingAlt("x", { file: "a", device: "phone", alt: " " })).toMatch(/write alt text/);
    expect(missingAlt("x", { file: "a", device: "phone", alt: "A list." })).toBeNull();
  });
});

describe("resolvePath and shotUrl", () => {
  it("fills placeholders and encodes them", () => {
    expect(resolvePath("/contests/{id}/log", { id: "a b" })).toBe("/contests/a%20b/log");
    expect(resolvePath("/today")).toBe("/today");
  });

  it("explains a missing placeholder", () => {
    expect(() => resolvePath("/contests/{contestId}", {})).toThrow("Set vars.contestId");
  });

  it("joins base and path cleanly", () => {
    expect(shotUrl("https://a.example/", "/demo")).toBe("https://a.example/demo");
    expect(shotUrl("https://a.example", "/?view=x")).toBe("https://a.example/?view=x");
    expect(() => shotUrl("", "/")).toThrow("Set baseUrl");
  });
});

describe("outputWidth", () => {
  it("caps and never enlarges", () => {
    expect(outputWidth("desktop", 2880)).toBe(2400);
    expect(outputWidth("phone", 780)).toBe(780);
    expect(outputWidth("phone", 600)).toBe(600);
  });
});

describe("redactions", () => {
  it("replaces longer names first", () => {
    const pairs = redactionPairs({ Ann: "Bea", "Ann Lee": "Cal Moe" });
    expect(pairs.map(([from]) => from)).toEqual(["Ann Lee", "Ann"]);
    expect(applyRedactions("Ann Lee and Ann", pairs)).toBe("Cal Moe and Bea");
  });

  it("drops blank names", () => {
    expect(redactionPairs({ "": "x", " ": "y" })).toEqual([]);
    expect(applyRedactions("hello", [])).toBe("hello");
  });
});
