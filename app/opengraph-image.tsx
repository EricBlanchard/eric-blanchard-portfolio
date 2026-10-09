import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name}, ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const hexes = [
  [0, 0, "#1f3552"],
  [1, 0, "#e39a2d"],
  [2, 0, "#1f3552"],
  [0.5, 1, "#e39a2d"],
  [1.5, 1, "#1f3552"],
  [1, 2, "#e39a2d"],
] as const;

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "80px",
        background: "#f1f3ee",
        color: "#12223a",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 112, fontWeight: 800, lineHeight: 1 }}>{site.name}</div>
        <div style={{ fontSize: 40, marginTop: 28, maxWidth: 640 }}>
          Web apps, data dashboards and games. Tested, fast, shipped by CI.
        </div>
      </div>
      <svg width="300" height="300" viewBox="0 0 300 300">
        {hexes.map(([c, r, fill]) => {
          const s = 50;
          const x = 60 + c * s * 1.73;
          const y = 60 + r * s * 1.5;
          const pts = [0, 1, 2, 3, 4, 5]
            .map((i) => {
              const a = (Math.PI / 180) * (60 * i - 30);
              return `${x + s * 0.94 * Math.cos(a)},${y + s * 0.94 * Math.sin(a)}`;
            })
            .join(" ");
          return <polygon key={`${c}-${r}`} points={pts} fill={fill} />;
        })}
      </svg>
    </div>,
    size,
  );
}
