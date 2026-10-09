import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Eric B.",
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: "#f1f3ee",
    theme_color: "#12223a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
