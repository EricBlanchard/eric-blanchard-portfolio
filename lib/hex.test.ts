import { describe, expect, it } from "vitest";
import {
  buildHexField,
  hexFieldMarkup,
  classifyTile,
  fieldSize,
  hash2,
  hexCorners,
  hexWidth,
  offsetToPixel,
  valueNoise,
} from "./hex";

describe("hex geometry", () => {
  it("computes the width of a pointy-top hex", () => {
    expect(hexWidth(10)).toBeCloseTo(17.32, 2);
  });

  it("shifts odd rows right by half a hex", () => {
    const even = offsetToPixel(0, 0, 10);
    const odd = offsetToPixel(0, 1, 10);
    expect(odd.x - even.x).toBeCloseTo(hexWidth(10) / 2, 5);
    expect(odd.y - even.y).toBeCloseTo(15, 5);
  });

  it("produces six corners at the right distance from the centre", () => {
    const corners = hexCorners(0, 0, 10)
      .split(" ")
      .map((p) => p.split(",").map(Number) as [number, number]);
    expect(corners).toHaveLength(6);
    for (const [x, y] of corners) {
      expect(Math.hypot(x, y)).toBeCloseTo(10, 0);
    }
  });

  it("sizes the field to contain every hex", () => {
    const { width, height } = fieldSize(4, 3, 10);
    const tiles = buildHexField({ cols: 4, rows: 3, size: 10, seed: 1 });
    for (const t of tiles) {
      expect(t.x).toBeLessThanOrEqual(width);
      expect(t.y).toBeLessThanOrEqual(height);
    }
  });

  it("does not add the half-hex offset for a single row", () => {
    expect(fieldSize(3, 1, 10).width).toBeCloseTo(hexWidth(10) * 3, 0);
  });
});

describe("noise", () => {
  it("is deterministic", () => {
    expect(hash2(3, 4, 7)).toBe(hash2(3, 4, 7));
    expect(valueNoise(1.5, 2.25, 7)).toBe(valueNoise(1.5, 2.25, 7));
  });

  it("stays within [0, 1)", () => {
    for (let i = 0; i < 200; i++) {
      const n = valueNoise(i * 0.37, i * 0.11, 3);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it("changes with the seed", () => {
    const a = Array.from({ length: 20 }, (_, i) => hash2(i, i, 1));
    const b = Array.from({ length: 20 }, (_, i) => hash2(i, i, 2));
    expect(a).not.toEqual(b);
  });
});

describe("buildHexField", () => {
  const options = { cols: 10, rows: 9, size: 24, seed: 7 };

  it("creates one tile per cell with unique keys", () => {
    const tiles = buildHexField(options);
    expect(tiles).toHaveLength(90);
    expect(new Set(tiles.map((t) => t.key)).size).toBe(90);
  });

  it("returns nothing for an empty grid", () => {
    expect(buildHexField({ ...options, cols: 0 })).toEqual([]);
  });

  it("is stable for the same seed", () => {
    expect(buildHexField(options)).toEqual(buildHexField(options));
  });

  it("includes a solar array, each panel with a module drawn on top", () => {
    const panels = buildHexField(options).filter((t) => t.kind === "panel");
    expect(panels.length).toBeGreaterThan(4);
    for (const p of panels) expect(p.module).not.toBeNull();
  });

  it("classifies every kind of terrain somewhere", () => {
    const kinds = new Set<string>();
    for (let seed = 0; seed < 10; seed++) {
      for (let r = 0; r < 9; r++)
        for (let c = 0; c < 10; c++) kinds.add(classifyTile(c, r, 10, 9, seed));
    }
    expect(kinds).toEqual(new Set(["water", "land", "forest", "panel"]));
  });
});

describe("hexFieldMarkup", () => {
  const tiles = buildHexField({ cols: 10, rows: 9, size: 24, seed: 7 });
  const { map, panels } = hexFieldMarkup(tiles);

  it("draws every tile, with panel modules on their own layer too", () => {
    const modules = tiles.filter((t) => t.module).length;
    expect(map.match(/<polygon /g)).toHaveLength(tiles.length + modules);
    expect(panels.match(/<polygon /g)).toHaveLength(modules);
  });

  it("contains nothing but numbers and known terrain names", () => {
    for (const html of [map, panels]) {
      const values = [...html.matchAll(/="([^"]*)"/g)].map((m) => m[1]);
      for (const v of values) expect(v).toMatch(/^([\d., -]+|water|land|forest|panel|hex-tile)$/);
    }
  });
});
