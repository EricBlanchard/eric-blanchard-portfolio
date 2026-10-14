const LOCAL_URL = "http://localhost:3000";

/**
 * The public origin, for canonical links, the sitemap and social previews.
 * Takes the first usable value: SITE_URL (set in CI), then URL (set by Netlify).
 * Empty or malformed values are skipped. An unset GitHub variable arrives as "".
 */
export function resolveSiteUrl(
  candidates: ReadonlyArray<string | undefined> = [process.env.SITE_URL, process.env.URL],
): string {
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;
    try {
      const url = new URL(value);
      if (url.protocol === "https:" || url.protocol === "http:") return url.origin;
    } catch {
      // not a URL; try the next one
    }
  }
  return LOCAL_URL;
}

/**
 * Site-wide facts. Anything marked `null` is optional and hidden when unset.
 */
export const site = {
  name: "Eric Blanchard",
  role: "Software developer",
  location: "Ontario, Canada",
  description:
    "Eric Blanchard builds fast, well-tested web apps, data dashboards and games, and runs the studio Deleptual.",
  url: resolveSiteUrl(),
  /** Public contact address, also the fallback when the contact form can't send. */
  email: "eric.blanchard@deleptual.ca",
  links: {
    linkedin: "https://www.linkedin.com/in/blanchard-eric",
    github: "https://github.com/EricBlanchard",
    studio: "https://deleptual.ca",
    source: "https://github.com/EricBlanchard/eric-blanchard-portfolio",
  },
} as const;

export const studio = {
  name: "Deleptual",
  founded: "July 2019",
  base: "Ontario, Canada",
  url: "https://deleptual.ca",
  summary:
    "Deleptual is my incorporated studio. It is where client web work gets built and where Hexploration is being made.",
  practice: [
    {
      title: "Web apps for clients",
      body: "Internal tools that do one job well, from a meal-prep business's weekly operations to a lead-generating budget calculator, built in Next.js and handed over with a deploy pipeline.",
    },
    {
      title: "Games",
      body: "Hexploration, a hex-map exploration game in Unity and C#, designed in a Notion wiki that feeds the editor tooling.",
    },
    {
      title: "Workflow engineering",
      body: "AI-assisted development set up properly: project rules, specialised agents, MCP connections into Unity and Notion, and CI that has the final say.",
    },
  ],
} as const;
