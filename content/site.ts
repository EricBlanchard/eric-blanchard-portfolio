/**
 * Site-wide facts. Anything marked `null` is optional and hidden when unset.
 */
export const site = {
  name: "Eric Blanchard",
  role: "Software developer",
  location: "Ontario, Canada",
  description:
    "Eric Blanchard builds fast, well-tested web apps, data dashboards and games, and runs the studio Deleptual.",
  /** Set SITE_URL in CI; Netlify also provides URL during builds. */
  url: process.env.SITE_URL ?? process.env.URL ?? "http://localhost:3000",
  /** Public contact address. Hidden until set. */
  email: null as string | null,
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
      body: "Small, durable tools that do one job well: calculators, lead flows and internal dashboards, built in Next.js and TypeScript and handed over with tests and a deploy pipeline.",
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
