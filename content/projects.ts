import { screenshotsFor } from "./screenshots";
import type { Project } from "./types";

/**
 * Every project on the site. Order here is the default order of the index.
 * To add screenshots, drop images in /public/work/<slug>/ and list them in `screenshots`.
 */
export const projects: Project[] = [
  {
    slug: "fleet-pulse",
    title: "Fleet Pulse",
    kind: "Portfolio",
    status: "Live",
    years: "2026",
    role: "Design and engineering",
    summary:
      "Role-based performance dashboards for a fleet of solar and battery sites. A portfolio piece built to learn ClickHouse and the big-data tools around it.",
    lede: "Asset managers, PV engineers, operations and executives look at the same fleet and need different answers. Fleet Pulse gives each of them a dashboard built around their decisions, on a synthetic fleet of utility-scale solar and BESS sites across Canada and the US. I built it to learn new technology by using it for real: ClickHouse for time-series telemetry, a GraphQL API over it, deck.gl for the map, and Docker so the same stack runs in the cloud or on-prem.",
    stack: [
      "Next.js 16",
      "TypeScript",
      "ClickHouse",
      "GraphQL",
      "deck.gl",
      "Docker",
      "Storybook",
      "Vitest",
      "GitHub Actions",
    ],
    highlights: [
      "Four dashboards, one per role, each built around a question: is the portfolio earning what it should, why is this site underperforming, what needs attention now, and are we on track.",
      "Loss attribution explains the gap between expected and actual output from telemetry alone, and is tested against the generator's answer key: fleet-wide losses land within 8% of the truth, with under 0.5% left unexplained.",
      "Wash-or-wait advice weighs the soiling a wash would recover against its cost and the next heavy rain, and flags outages worth a truck roll.",
      "The same ClickHouse image and numbered, forward-only migrations run on a laptop, a cloud droplet or an on-prem Linux host. Nothing on the dashboards calls a third-party service.",
      "CI runs four jobs in parallel: lint, types and unit tests; every Storybook story in Chromium with axe checks; SQL tests against a ClickHouse service container; and the full build.",
    ],
    caseStudy: [
      {
        type: "table",
        heading: "One fleet, four views",
        intro: "Each role gets the question it asks, and only the data that answers it.",
        columns: ["Role", "The question", "What it shows"],
        rows: [
          [
            "Asset manager",
            "Is this portfolio earning what it should?",
            "Revenue earned and lost by site and cause, wash-or-wait payback, the fleet map",
          ],
          [
            "PV engineer",
            "Why is this underperforming?",
            "A performance-index heatmap, where each shortfall goes, strings below their siblings",
          ],
          [
            "Operations",
            "What needs attention right now?",
            "A dispatch queue ranked by revenue at stake, with rain and curtailment for context",
          ],
          [
            "Executive",
            "Are we on track, and where's the risk?",
            "Revenue and energy against a P50 budget, a month-end forecast, a budget-to-actual bridge",
          ],
        ],
      },
      {
        type: "list",
        heading: "Synthetic data with an answer key",
        intro:
          "Real fleet data is never public, so the fleet is generated, and the generator keeps score.",
        items: [
          "Physics from sun position to inverter output: clear-sky irradiance, cloud cover, module temperature, string DC and inverter clipping.",
          "Telemetry carries only what SCADA would report, with measurement noise and communication outages.",
          "Planted faults (inverter outages, curtailment, soiling, offline and degraded strings) come with the energy each one really cost.",
          "Every value is a pure function of seed, device and time, so any slice of the data can be regenerated exactly.",
        ],
      },
      {
        type: "text",
        heading: "Built to be checked",
        body: [
          "Every component is in Storybook and tested in a real browser with accessibility checks. The site explains itself too: a How it's built page reads live table sizes and compression from ClickHouse's system tables, and a Who it's for page writes down each role's assumptions so they can be tested.",
        ],
      },
    ],
    screenshots: screenshotsFor("fleet-pulse"),
    // The Netlify site name predates the Fleet Pulse name; update this if it's renamed.
    links: [{ label: "Open the live demo", href: "https://enurgen-portfolio.netlify.app" }],
    relevance: ["energy", "consulting", "product"],
  },
  {
    slug: "ontario-grid-capacity",
    title: "Ontario grid capacity",
    kind: "Personal",
    status: "Live",
    years: "2026",
    role: "Design, data and engineering",
    summary:
      "A fast WebGL map of every Hydro One station, coloured by how much new generation it can still accept, with solar farm sites rated on a 1 km grid.",
    lede: "Hydro One publishes how much capacity each station has and every application against it, but as PDFs with no map and no coordinates. This turns them into an answer to one question, where a new generator could still connect, and shows the source behind every number.",
    stack: [
      "Next.js 16",
      "TypeScript",
      "React Three Fiber",
      "three.js",
      "Zustand",
      "Python",
      "OpenStreetMap",
      "Vitest",
      "Playwright",
    ],
    highlights: [
      "Free capacity is the station's published thermal capacity minus every application on it, also limited by the transformer bus upstream. That reproduces the station thermal test in Hydro One's own calculator; the map says plainly that it's a screening signal, not a guarantee.",
      "Every value traces back to a source you can open: a page of a Hydro One PDF or an OpenStreetMap feature. Tests check that all 7,695 citations point at a real page.",
      "The PDFs have no coordinates, so each station is placed only from evidence, best match first, and every placement is checked against how far feeders can reach. Stations that can't be placed honestly aren't drawn.",
      "Matching applications to the IESO's contracted generation list (1,411 matches) flags capacity held by projects that most likely never got built.",
      "All geometry is projected and triangulated at build time into a compact binary format, so the browser does no geometry work: one draw call per layer, and no GPU work at all while the map is idle.",
    ],
    caseStudy: [
      {
        type: "list",
        heading: "Solar farm sites",
        intro:
          "A 1 km grid is rated for ground-mounted solar at three sizes, each with its own filter.",
        items: [
          "Grid: a connection close enough for that size has room for it, from a station's own feeders to a dedicated line to a transformer station for farms over 10 MW.",
          "Land: prime farmland, wetlands, parks, protected areas and water rule a square out, and the usable share has to hold the farm at 7 acres per MW.",
          "Unsuitable squares can be shown too, each saying why, so a near miss is as informative as a fit.",
        ],
      },
      {
        type: "list",
        heading: "The path to the grid",
        intro: "Open a station and the panel walks each hop the power would take.",
        items: [
          "The station's own feeders, then the upstream feeder and its voltage limit, minus what's already applied for on it.",
          "The upstream transformer bus, then the transmission grid and any constraint flagged there.",
          "Feeder routes traced along OpenStreetMap lines where they're mapped, with the distance, since feeders are limited mainly by length.",
        ],
      },
      {
        type: "text",
        heading: "Fast, and usable without a mouse",
        body: [
          "First load is about 176 KB of JavaScript plus the map data, fetched in parallel; power lines and per-station details load only when needed. The station search is a full ARIA combobox, the map can be panned and zoomed from the keyboard, and status is always spelled out in text as well as colour. The end-to-end suite fails on any serious accessibility violation, on desktop and phone.",
        ],
      },
    ],
    screenshots: screenshotsFor("ontario-grid-capacity"),
    links: [{ label: "Open the live map", href: "https://canada-energy-map.netlify.app" }],
    relevance: ["energy", "consulting", "product"],
  },
  {
    slug: "studio-simulator",
    title: "Studio simulator",
    kind: "Classroom aid",
    status: "In use",
    years: "2025 to now",
    role: "Design and engineering",
    summary:
      "A business simulation that runs alongside the game production course I teach, used by students every week of the semester.",
    lede: "Game production students learn to make games, but rarely feel the business pressure around them. In this simulation, each team runs a studio: it hires staff, pays salaries, weathers market events and invests in rival studios, week by week through the semester.",
    stack: [
      "Next.js 15",
      "React 19",
      "Firebase Auth",
      "Firestore",
      "React Hook Form",
      "Zod",
      "DigitalOcean Spaces",
      "Netlify",
    ],
    highlights: [
      "It runs in production with live student data during the semester, so every schema change is additive and backwards compatible, following written migration guidelines.",
      "Each class runs in its own game instance, isolated from the others and archived at the end of term.",
      "The instructor can roll back any weekly event, so a mistake becomes a lesson rather than a lost grade.",
      "Hireable employees come with generated resumes and stats by role and seniority, from junior programmers to senior audio designers.",
      "Document quality (market research, pitch, game plan) feeds the production multipliers, so planning has a visible effect on results.",
    ],
    caseStudy: [
      {
        type: "list",
        heading: "What a week looks like",
        items: [
          "Salaries are paid and production advances based on each studio's team and its documents.",
          "A market event lands, and every studio feels it differently.",
          "Students hire, fire and assign staff, and invest network points in other studios.",
          "The instructor reviews the results and can roll anything back before it counts.",
        ],
      },
      {
        type: "text",
        heading: "Why build it",
        body: [
          "Static gamification (badges, points, leaderboards) doesn't teach production. A living economy does: decisions have knock-on effects across budget, staffing, production and investment, the way they do in a real studio.",
        ],
      },
    ],
    screenshots: screenshotsFor("studio-simulator"),
    links: [],
    relevance: ["product", "games"],
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
    screenshots: screenshotsFor("step-contest"),
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
      "Danielle + Eric = Daric. A private household app for our two phones: shared lists, tasks, people and a morning digest, built as an installable PWA.",
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
    screenshots: screenshotsFor("daric"),
    links: [],
    relevance: ["product"],
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
    screenshots: screenshotsFor("hexploration"),
    links: [{ label: "Deleptual", href: "https://deleptual.ca" }],
    relevance: ["games"],
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
