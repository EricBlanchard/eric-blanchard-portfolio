/**
 * Geometry and generation for the hero's hex field.
 * Pure functions, rendered on the server, so the hero ships no JavaScript.
 *
 * Layout is pointy-top hexes in "odd-r" offset coordinates:
 * odd rows are pushed right by half a hex.
 */

export type TileKind = "water" | "land" | "forest" | "panel";

export interface HexTile {
  key: string;
  col: number;
  row: number;
  x: number;
  y: number;
  points: string;
  /** Panel tiles draw a smaller module on top of the ground hex. */
  module: string | null;
  kind: TileKind;
}

export interface HexFieldOptions {
  cols: number;
  rows: number;
  /** Distance from centre to corner. */
  size: number;
  seed: number;
}

const SQRT3 = Math.sqrt(3);

export function hexWidth(size: number): number {
  return SQRT3 * size;
}

/** Centre of the hex at an odd-r offset coordinate. */
export function offsetToPixel(col: number, row: number, size: number): { x: number; y: number } {
  const w = hexWidth(size);
  const x = w * (col + 0.5 * (row & 1)) + w / 2;
  const y = size * 1.5 * row + size;
  return { x, y };
}

/** SVG polygon points for a pointy-top hex, rounded to keep markup small. */
export function hexCorners(cx: number, cy: number, size: number): string {
  const corners: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    const px = round(cx + size * Math.cos(angle));
    const py = round(cy + size * Math.sin(angle));
    corners.push(`${px},${py}`);
  }
  return corners.join(" ");
}

/** Pixel size of a field, for the SVG viewBox. */
export function fieldSize(
  cols: number,
  rows: number,
  size: number,
): { width: number; height: number } {
  const w = hexWidth(size);
  return {
    width: round(w * cols + (rows > 1 ? w / 2 : 0)),
    height: round(size * 1.5 * (rows - 1) + size * 2),
  };
}

/** Deterministic hash of a lattice point into [0, 1). */
export function hash2(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967296;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Smooth value noise in [0, 1). Same inputs always give the same output. */
export function valueNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smooth(x - x0);
  const ty = smooth(y - y0);
  const a = hash2(x0, y0, seed);
  const b = hash2(x0 + 1, y0, seed);
  const c = hash2(x0, y0 + 1, seed);
  const d = hash2(x0 + 1, y0 + 1, seed);
  const top = a + (b - a) * tx;
  const bottom = c + (d - c) * tx;
  return top + (bottom - top) * ty;
}

export function classifyTile(
  col: number,
  row: number,
  cols: number,
  rows: number,
  seed: number,
): TileKind {
  const n = valueNoise(col / 3.2, row / 3.2, seed);
  if (n < 0.34) return "water";
  // A solar array on the dry ground in the right half of the map.
  const inArray =
    col >= Math.floor(cols * 0.55) &&
    col < cols - 1 &&
    row >= Math.floor(rows * 0.25) &&
    row < Math.ceil(rows * 0.75);
  if (inArray) return "panel";
  return n > 0.62 ? "forest" : "land";
}

export function buildHexField({ cols, rows, size, seed }: HexFieldOptions): HexTile[] {
  if (cols < 1 || rows < 1) return [];
  const tiles: HexTile[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const { x, y } = offsetToPixel(col, row, size);
      const kind = classifyTile(col, row, cols, rows, seed);
      tiles.push({
        key: `${col}:${row}`,
        col,
        row,
        x: round(x),
        y: round(y),
        points: hexCorners(x, y, size * 0.94),
        module: kind === "panel" ? hexCorners(x, y, size * 0.62) : null,
        kind,
      });
    }
  }
  return tiles;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * The field as SVG markup: the whole map, and the panel modules alone (for the reveal layer).
 * Built only from numbers and the fixed terrain names, so it is safe to insert as HTML.
 */
export function hexFieldMarkup(tiles: HexTile[]): { map: string; panels: string } {
  const polygon = (points: string, kind: TileKind) =>
    `<polygon points="${points}" data-kind="${kind}" class="hex-tile"></polygon>`;
  let map = "";
  let panels = "";
  for (const tile of tiles) {
    if (tile.module) {
      map += `<g>${polygon(tile.points, "land")}${polygon(tile.module, "panel")}</g>`;
      panels += `<polygon points="${tile.module}"></polygon>`;
    } else {
      map += polygon(tile.points, tile.kind);
    }
  }
  return { map, panels };
}
