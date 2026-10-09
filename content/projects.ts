import type { Project } from "./types";

/**
 * Every project on the site. Order here is the default order of the index.
 * To add screenshots, drop images in /public/work/<slug>/ and list them in `screenshots`.
 */
export const projects: Project[] = [
  {
    slug: "solar-performance-dashboard",
    title: "Solar performance dashboard",
    kind: "Personal",
    status: "In development",
    years: "2026",
    role: "Design and engineering",
    summary:
      "A Next.js and TypeScript dashboard for exploring large solar-performance datasets without the page slowing down.",
    lede: "I am building this to work on the problems energy software teams deal with daily: very large time-series tables, charts that have to stay responsive, and numbers that people make decisions on. It is a working project, so this page will grow with it.",
    stack: ["Next.js", "TypeScript", "SQL", "Data visualization", "Vitest"],
    highlights: [
      "Queries are aggregated in SQL before they reach the browser, so a chart never receives more points than it can draw.",
      "Charts are built for reading: shared axes, consistent units, and direct labels instead of legends where possible.",
      "The same testing and CI setup as this site: typed end to end, with every component in Storybook.",
    ],
    caseStudy: [
      {
        type: "text",
        heading: "Why this project",
        body: [
          "Solar and battery operators work with data at a scale where naive dashboards fall over. Plant output, irradiance and expected yield arrive as long time series, and the useful questions involve comparing them across sites and seasons.",
          "The goal is a dashboard that answers those questions quickly and honestly, and a codebase that another engineer could pick up tomorrow.",
        ],
      },
      {
        type: "list",
        heading: "What it is designed to do",
        items: [
          "Compare measured output with expected yield across sites and date ranges.",
          "Keep interactions fast on large tables by pushing aggregation into the database.",
          "Make every chart explain its units, time zone and data window.",
        ],
      },
    ],
    screenshots: [],
    links: [],
    relevance: ["energy", "consulting", "product"],
  },
  {
    slug: "step-contest",
    title: "Step contest",
    kind: "Personal",
    status: "In use",
    years: "2026",
    role: "Design and engineering",
    summary:
      "A mobile-first step challenge for groups of friends, with a live leaderboard and privacy rules enforced by the database.",
    lede: "Logging a day should take two taps and a number. Behind that simple screen is a role system, a live leaderboard derived from raw entries, and a privacy model that the database enforces rather than the UI.",
    stack: [
      "Next.js 16",
      "TypeScript",
      "Firebase Auth",
      "Firestore",
      "Cloud Storage",
      "Cloud Functions",
      "Netlify",
      "PWA",
    ],
    highlights: [
      "Emails are never visible to other participants. Leaderboard data is denormalised onto participant documents, and user documents are readable only by their owner and site admins.",
      "Private evidence is split into its own collection, and Storage rules check Firestore with a cross-service lookup, so even a leaked image URL is unreadable.",
      "Entries lock at midnight on the last day in the contest's own time zone, compared against server time, so a device with the wrong clock cannot buy extra days.",
      "Lifetime totals use an atomic increment, so two phones logging at once cannot overwrite each other.",
      "One hourly scheduled function sends evening reminders at 7pm in each contest's time zone and prunes dead push tokens as it goes.",
    ],
    caseStudy: [
      {
        type: "table",
        heading: "Roles",
        intro: "A person can hold any combination of these across any number of contests.",
        columns: ["Role", "Scope", "Granted by"],
        rows: [
          ["Site admin", "Whole instance", "Another site admin (the first is set by hand)"],
          ["Contest admin", "One contest", "The contest creator, or another contest admin"],
          ["Participant", "One contest", "Joining with an invite code"],
        ],
      },
      {
        type: "text",
        heading: "The leaderboard",
        body: [
          "The leaderboard is derived live from entry documents with Firestore snapshots, so it updates the moment anyone logs, edits or deletes. Alongside the ranking there is a cumulative race chart, streaks, the gap to the person above you, and highlights such as longest streak and biggest single day.",
          "Each highlight goes to a different person on purpose, so the top spot is not the only thing worth winning.",
        ],
      },
      {
        type: "list",
        heading: "Privacy, enforced by the rules files",
        intro:
          "Two promises are kept by Firestore and Storage security rules, not by hiding buttons.",
        items: [
          "Each entry is split into a public part (date and step count, which the leaderboard needs) and an evidence part (note and screenshot).",
          "Whether evidence is public is chosen when a contest is created and cannot be changed afterwards, because people upload screenshots on that promise.",
          "Edits append to a changelog every member can read, including corrections made by admins after the contest closes.",
        ],
      },
      {
        type: "text",
        heading: "Cost",
        body: [
          "For a group of friends it runs at no monthly cost. Screenshots are downscaled to 1600px and re-encoded as JPEG in the browser before upload, which keeps each one under roughly 300 KB and the whole project inside the free tiers.",
        ],
      },
    ],
    screenshots: [],
    links: [],
    relevance: ["product", "consulting"],
  },
  {
    slug: "daric",
    title: "Daric",
    kind: "Personal",
    status: "Private",
    years: "2026",
    role: "Design and engineering",
    summary:
      "A private household app for two phones: shared lists, tasks, people and a morning digest, built as an installable PWA.",
    lede: "Daric is a small, private home for our household. It replaced a handful of apps with one that does exactly what we need, and it is built so that adding a new part takes minutes.",
    stack: [
      "Next.js 16",
      "TypeScript",
      "Tailwind CSS 4",
      "Firebase Auth",
      "Firestore",
      "Cloud Messaging",
      "Netlify Functions",
      "PWA",
    ],
    highlights: [
      "Sign-in is locked to two Google accounts. The allowlist is enforced in three places: the browser, the Firestore rules, and the notification API.",
      "Realtime and offline by default: an item added on one phone appears on the other immediately, and Firestore's local cache keeps it working without signal.",
      "Notifications are batched, so adding six things sends one push, not six.",
      "A 6am digest is built per phone: local weather, that person's tasks, today's reminders and birthdays, and nothing at all on an empty day.",
      "Everything is a module. A new shopping list is one definition and two three-line route files; the tile, import screen, notifications and app shortcut follow from it.",
    ],
    caseStudy: [
      {
        type: "list",
        heading: "What is in it",
        items: [
          "Shared grocery and hardware lists, realtime between both phones.",
          "Short and long-term tasks, assignable to either of us or to anyone, with an archive that collects finished tasks after a week.",
          "People: the folks we meet, how we know them, follow-ups with as many reminder days as needed, and per-person sharing (private, view-only or editable).",
          "A Today page that mirrors the morning digest and can open automatically once a day.",
          "List import from a tap-to-import link, a JSON or markdown file, or a paste, with duplicates flagged before anything is written.",
        ],
      },
      {
        type: "list",
        heading: "Adding a new area",
        intro:
          "The home screen renders whichever modules this device has switched on. A new area is roughly four steps:",
        items: [
          "A route under app/.",
          "A match block in firestore.rules. The catch-all denies anything not explicitly allowed.",
          "An entry in the module registry, which gives it a tile and a switch in Settings. New modules default to off.",
          "Optionally, a call to notify the other person when something happens.",
        ],
      },
      {
        type: "text",
        heading: "Design",
        body: [
          "The palette and type live in one stylesheet as custom properties, exposed to Tailwind, so a single change updates light and dark mode everywhere. App icons are generated by a script rather than drawn by hand, and a daily photo background makes the cards go frosted automatically.",
        ],
      },
    ],
    screenshots: [],
    links: [],
    relevance: ["product"],
  },
  {
    slug: "retreat-budget-calculator",
    title: "Retreat budget calculator",
    kind: "Client work",
    status: "Live",
    years: "2026",
    role: "Built through Deleptual",
    summary:
      "A budget calculator for Moniker Partners that turns a prospect's retreat plans into an estimate and a qualified lead.",
    lede: "Moniker Partners plans company retreats. They needed prospects to get a realistic budget on their own, and needed those estimates to arrive in their inbox as leads they could act on.",
    stack: ["JavaScript", "EmailJS", "SendGrid", "Custom domain email"],
    highlights: [
      "The call to action emails the full estimate to Moniker and copies the person who filled in the form, so both sides start from the same numbers.",
      "Email goes out through EmailJS and SendGrid from an authenticated sending domain, which keeps it out of spam folders.",
    ],
    caseStudy: [
      {
        type: "text",
        heading: "The job",
        body: [
          "A calculator is only useful to a business if it leads somewhere. This one does the arithmetic a prospect would otherwise ask for on a call, then hands Moniker a written estimate with the prospect already copied in.",
        ],
      },
    ],
    screenshots: [],
    links: [],
    relevance: ["consulting"],
  },
  {
    slug: "hexploration",
    title: "Hexploration",
    kind: "Studio",
    status: "In development",
    years: "Ongoing",
    role: "Design and engineering at Deleptual",
    summary:
      "A hex-map exploration game in Unity and C#, built on data-driven content systems and its own editor tooling.",
    lede: "Hexploration is the game Deleptual is making. It is headed for Steam on PC first, and nothing is public yet, so this page focuses on how it is built.",
    stack: ["Unity", "C#", "ScriptableObjects", "Editor tooling", "Notion"],
    highlights: [
      "Levels, quests, the rarity ladder, world generation and world modifiers are all data: ScriptableObject assets that designers can change without touching code.",
      "Custom editor tooling and a published reference keep that content consistent as it grows.",
      "Design lives in a Notion wiki that is connected to the Unity project, so the documents and the implementation stay in step.",
    ],
    caseStudy: [
      {
        type: "text",
        heading: "Why it matters outside games",
        body: [
          "Games are a demanding place to practise software engineering: real-time performance budgets, large amounts of structured content, and systems that have to stay balanced as they change. The same habits carry straight into product work.",
        ],
      },
    ],
    screenshots: [],
    links: [{ label: "Deleptual", href: "https://deleptual.ca" }],
    relevance: ["games"],
  },
  {
    slug: "ai-development-workflow",
    title: "AI development workflow",
    kind: "Workflow",
    status: "In use",
    years: "2026",
    role: "Design and engineering",
    summary:
      "How I use Claude Code with Unity and Notion: specialised agents, project rules and MCP connections, with tests and CI as the final word.",
    lede: "AI is one of my tools, not a replacement for judgement. This is the setup I use across my projects, including this site, and the guardrails that keep it honest.",
    stack: ["Claude Code", "MCP", "Unity", "Notion", "GitHub Actions"],
    highlights: [
      "Specialised agents with their own context: a level designer, a balance tuner and a feedback specialist, coordinated with explicit handoffs.",
      "Project rules live in the repository (AGENTS.md, prompt files and the .claude directory), so every session starts with the same conventions.",
      "MCP connections let the agent read and edit the Unity scene and the Notion design wiki directly instead of working from pasted context.",
      "Nothing merges because an AI wrote it. Type checks, tests, accessibility checks and performance budgets run in CI on every change, and I review every diff.",
    ],
    caseStudy: [
      {
        type: "list",
        heading: "The loop",
        items: [
          "Write down the intent in the design wiki or an issue.",
          "Let the right agent draft the change with the project's rules loaded.",
          "Run the tests locally and read the diff.",
          "Open a pull request; CI decides whether it can merge.",
        ],
      },
    ],
    screenshots: [],
    links: [],
    relevance: ["consulting", "energy", "games", "product"],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** The project after `slug`, wrapping around, for "next project" links. */
export function getNextProject(slug: string): Project {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) throw new Error(`Unknown project: ${slug}`);
  const next = projects[(index + 1) % projects.length];
  if (!next) throw new Error("No projects defined");
  return next;
}
