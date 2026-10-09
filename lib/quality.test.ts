import { describe, expect, it } from "vitest";
import { measuredReport } from "./fixtures";
import {
  allPassing,
  emptyReport,
  formatCount,
  formatDate,
  formatPercent,
  formatScore,
  parseQuality,
  shortCommit,
} from "./quality";

describe("parseQuality", () => {
  it("returns an empty report for junk input", () => {
    expect(parseQuality(null)).toEqual(emptyReport);
    expect(parseQuality("nope")).toEqual(emptyReport);
    expect(parseQuality(42)).toEqual(emptyReport);
  });

  it("round-trips a complete report", () => {
    expect(parseQuality(JSON.parse(JSON.stringify(measuredReport)))).toEqual(measuredReport);
  });

  it("drops fields with the wrong type instead of trusting them", () => {
    const parsed = parseQuality({
      generatedAt: "",
      commit: 123,
      unit: { tests: "12", passed: Number.NaN, files: 3 },
      lighthouse: { performance: Infinity, seo: 0.98 },
    });
    expect(parsed.generatedAt).toBeNull();
    expect(parsed.commit).toBeNull();
    expect(parsed.unit).toEqual({ tests: null, passed: null, files: 3 });
    expect(parsed.lighthouse.performance).toBeNull();
    expect(parsed.lighthouse.seo).toBe(0.98);
  });
});

describe("formatting", () => {
  it("shows Lighthouse scores out of 100", () => {
    expect(formatScore(0.987)).toBe("99");
    expect(formatScore(null)).toBe("–");
  });

  it("formats percentages and counts", () => {
    expect(formatPercent(97.44)).toBe("97%");
    expect(formatPercent(97.44, 1)).toBe("97.4%");
    expect(formatPercent(null)).toBe("–");
    expect(formatCount(1234)).toBe("1,234");
    expect(formatCount(null)).toBe("–");
  });

  it("shortens commits to seven characters", () => {
    expect(shortCommit("3bc88c1a9e0f")).toBe("3bc88c1");
    expect(shortCommit(null)).toBeNull();
  });

  it("formats dates in Toronto time", () => {
    // 02:00 UTC on the 10th is still the 9th in Toronto.
    expect(formatDate("2026-10-10T02:00:00Z")).toBe("October 9, 2026");
    expect(formatDate("not a date")).toBeNull();
    expect(formatDate(null)).toBeNull();
  });
});

describe("allPassing", () => {
  it("needs at least one test and no failures", () => {
    expect(allPassing({ tests: 3, passed: 3 })).toBe(true);
    expect(allPassing({ tests: 3, passed: 2 })).toBe(false);
    expect(allPassing({ tests: 0, passed: 0 })).toBe(false);
    expect(allPassing({ tests: null, passed: null })).toBe(false);
  });
});
