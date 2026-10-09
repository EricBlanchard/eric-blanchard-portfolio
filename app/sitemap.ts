import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/engineering`, priority: 0.8 },
    { url: `${base}/studio`, priority: 0.7 },
    ...projects.map((p) => ({ url: `${base}/work/${p.slug}`, priority: 0.8 })),
  ];
}
