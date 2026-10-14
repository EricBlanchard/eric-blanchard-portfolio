import { describe, expect, it } from "vitest";
import type { Screenshot } from "@/content/types";
import { groupDesktopShots } from "./ScreenshotGallery";

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
