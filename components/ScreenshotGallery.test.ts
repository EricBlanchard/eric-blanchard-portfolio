import { describe, expect, it } from "vitest";
import type { Screenshot } from "@/content/types";
import { cssWidth, groupDesktopShots, phoneColumns } from "./ScreenshotGallery";

const shot = (src: string, width: number): Screenshot => ({
  src,
  alt: src,
  width,
  height: 800,
  device: "desktop",
});

describe("groupDesktopShots", () => {
  it("pairs consecutive half-width panels and keeps wide ones alone", () => {
    const groups = groupDesktopShots([
      shot("wide-1", 2274),
      shot("narrow-1", 882),
      shot("narrow-2", 1346),
      shot("narrow-3", 882),
      shot("wide-2", 2400),
    ]);
    expect(groups.map((g) => (g.kind === "wide" ? g.shot.src : g.shots.map((s) => s.src)))).toEqual(
      ["wide-1", ["narrow-1", "narrow-2"], ["narrow-3"], "wide-2"],
    );
  });

  it("handles no shots", () => {
    expect(groupDesktopShots([])).toEqual([]);
  });
});

describe("phoneColumns", () => {
  it("avoids a lonely last row", () => {
    expect([4, 5, 6, 7, 8, 9, 10].map(phoneColumns)).toEqual([4, 3, 3, 4, 4, 3, 4]);
  });
});

describe("cssWidth", () => {
  it("halves desktop captures and reads a phone capture's scale from its width", () => {
    expect(cssWidth({ device: "desktop", width: 2400 })).toBe(1200);
    expect(cssWidth({ device: "phone", width: 780 })).toBe(390);
    expect(cssWidth({ device: "phone", width: 375 })).toBe(375);
    expect(cssWidth({ device: "phone", width: 1170 })).toBe(390);
  });
});
