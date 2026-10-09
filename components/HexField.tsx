import { buildHexField, fieldSize } from "@/lib/hex";

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
 * Pure SVG rendered on the server; the reveal is CSS and respects reduced motion.
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
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      focusable="false"
      data-testid="hex-field"
    >
      {tiles.map((tile) => {
        const style = { "--d": `${tile.delay}ms` } as React.CSSProperties;
        const cls = animate ? "hex-tile" : "hex-tile hex-still";
        return tile.module ? (
          <g key={tile.key}>
            <polygon points={tile.points} data-kind="land" className={cls} style={style} />
            <polygon points={tile.module} data-kind="panel" className={cls} style={style} />
          </g>
        ) : (
          <polygon
            key={tile.key}
            points={tile.points}
            data-kind={tile.kind}
            className={cls}
            style={style}
          />
        );
      })}
    </svg>
  );
}
