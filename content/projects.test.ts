import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getNextProject, getProject, projects } from "./projects";

describe("project content", () => {
  it("has unique, URL-safe slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(projects.map((p) => [p.slug, p] as const))("%s is complete", (_slug, project) => {
    expect(project.title.length).toBeGreaterThan(0);
    // The index shows the summary in a narrow column; keep it to one sentence.
    expect(project.summary.length).toBeLessThanOrEqual(160);
    expect(project.summary.trim().endsWith(".")).toBe(true);
    expect(project.highlights.length).toBeGreaterThan(0);
    expect(project.caseStudy.length).toBeGreaterThan(0);
    expect(project.stack.length).toBeGreaterThan(0);
  });

  it("only references screenshots that exist, with alt text", () => {
    for (const project of projects) {
      for (const shot of project.screenshots) {
        expect(shot.alt.length, `${project.slug} ${shot.src}`).toBeGreaterThan(0);
        expect(existsSync(join(process.cwd(), "public", shot.src))).toBe(true);
      }
    }
  });

  it("uses https for external links", () => {
    for (const project of projects) {
      for (const link of project.links) expect(link.href).toMatch(/^https:\/\//);
    }
  });

  it("gives every table row as many cells as columns", () => {
    for (const project of projects) {
      for (const block of project.caseStudy) {
        if (block.type !== "table") continue;
        for (const row of block.rows) expect(row).toHaveLength(block.columns.length);
      }
    }
  });
});

describe("lookups", () => {
  it("finds a project by slug", () => {
    expect(getProject("daric")?.title).toBe("Daric");
    expect(getProject("missing")).toBeUndefined();
  });

  it("wraps from the last project to the first", () => {
    const last = projects.at(-1)!;
    expect(getNextProject(last.slug)).toBe(projects[0]);
    expect(getNextProject(projects[0]!.slug)).toBe(projects[1]);
  });

  it("throws for an unknown slug", () => {
    expect(() => getNextProject("missing")).toThrow("Unknown project");
  });
});
