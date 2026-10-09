import { describe, expect, it } from "vitest";
import { emptyReport, measuredReport } from "@/lib/fixtures";
import { pipelineSteps } from "./Pipeline";

describe("pipelineSteps", () => {
  it("lists the eight stages in order", () => {
    expect(pipelineSteps(emptyReport).map((s) => s.title)).toEqual([
      "Pull request",
      "Static checks",
      "Unit and component tests",
      "Storybook",
      "End to end",
      "Performance budget",
      "Deploy",
      "Stay current",
    ]);
  });

  it("shows no results when nothing has been measured", () => {
    expect(pipelineSteps(emptyReport).every((s) => s.result === null)).toBe(true);
  });

  it("reports measured results in plain language", () => {
    const results = pipelineSteps(measuredReport).map((s) => s.result);
    expect(results).toContain("128 tests, 97% line coverage");
    expect(results).toContain("34 stories");
    expect(results).toContain("42 checks, 0 accessibility violations");
    expect(results).toContain("Performance 100, accessibility 100");
    expect(results).toContain("Live build 3bc88c1");
  });
});
