import { describe, expect, it } from "vitest";
import { TARGET_BENCHMARK_INDEX, cpuSlowdownFor, medianOf } from "./lighthouseCalibration";

describe("cpuSlowdownFor", () => {
  it("uses Lighthouse's 4x on a high-end desktop or faster", () => {
    expect(cpuSlowdownFor(1750)).toBe(4);
    expect(cpuSlowdownFor(3000)).toBe(4);
  });

  it("slows a weaker host less, so the simulated phone stays the same", () => {
    expect(cpuSlowdownFor(1000)).toBe(2.3);
    expect(cpuSlowdownFor(1300)).toBe(3);
    // host index / multiplier stays near the target device
    expect(1300 / cpuSlowdownFor(1300)).toBeCloseTo(TARGET_BENCHMARK_INDEX, -1);
  });

  it("never goes below 1x", () => {
    expect(cpuSlowdownFor(200)).toBe(1);
  });

  it("falls back to 4x without a reading", () => {
    expect(cpuSlowdownFor(Number.NaN)).toBe(4);
    expect(cpuSlowdownFor(0)).toBe(4);
  });
});

describe("medianOf", () => {
  it("takes the middle reading and ignores bad ones", () => {
    expect(medianOf([1200, 900, 1500])).toBe(1200);
    expect(medianOf([1000, 1400])).toBe(1200);
    expect(medianOf([Number.NaN, 1100])).toBe(1100);
    expect(medianOf([])).toBeNaN();
  });
});
