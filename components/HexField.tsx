import { buildHexField, fieldSize, hexFieldMarkup } from "@/lib/hex";

export interface HexFieldProps {
  cols?: number;
  rows?: number;
  seed?: number;
  /** Turn off the reveal, e.g. for static previews. */
  animate?: boolean;
  className?: string;
}

const SIZE = 24;

/**
 * A generated hex map with a solar array on it: half game board, half energy site.
 * Pure SVG rendered on the server, so it ships no JavaScript. The polygons go in as markup
 * rather than React elements, so hydration skips them instead of walking ~140 nodes that
 * never change.
 *
 * The map itself never animates. The reveal is two layers on top that the browser moves on
 * the GPU (transform and opacity only), so it costs nothing on the main thread while the page
 * loads: a curtain in the page colour sweeps off to the right like sunrise, and an amber copy
 * of the panels fades away after it, so the array "charges". Both are skipped under reduced
 * motion.
 */
export function HexField({
  cols = 10,
  rows = 9,
  seed = 7,
  animate = true,
  className,
}: HexFieldProps) {
  const tiles = buildHexField({ cols, rows, size: SIZE, seed });
  const { width, height } = fieldSize(cols, rows, SIZE);
  const viewBox = `0 0 ${width} ${height}`;
  const markup = hexFieldMarkup(tiles);
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      aria-hidden="true"
      data-testid="hex-field"
    >
      {/* Static markup: React has nothing to hydrate inside these (see hexFieldMarkup). */}
      <svg
        viewBox={viewBox}
        className="block h-auto w-full"
        focusable="false"
        dangerouslySetInnerHTML={{ __html: markup.map }}
      />
      {animate && (
        <>
          <svg
            viewBox={viewBox}
            className="hex-charge"
            focusable="false"
            dangerouslySetInnerHTML={{ __html: markup.panels }}
          />
          <span className="hex-curtain" />
        </>
      )}
    </div>
  );
}
