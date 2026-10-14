/**
 * Client work built through Deleptual. Most of it is internal tools with nothing public to
 * show, so those offer a walkthrough on a call; public work links to the live site.
 */
export interface ClientEngagement {
  client: string;
  what: string;
  /** Leave empty to keep the entry to one line. */
  detail: string;
  stack: string[];
  /** The live site, for public work. */
  href?: string;
}

export const clientWork: ClientEngagement[] = [
  {
    client: "Kristin Chef",
    what: "Operations app for a meal-prep business",
    detail:
      "Turns each week's chef menus into chef assignments, ingredient counts, shopping lists, printable labels and Excel, Word and PDF exports, alongside clients, recipes, delivery schedules and client emails.",
    stack: ["Next.js", "React", "Firebase", "EmailJS", "Document generation"],
  },
  {
    client: "Moniker Partners",
    what: "Retreat budget calculator",
    detail:
      "Turns a prospect's retreat plans into a budget, pricing the flights through a flight API, then emails the estimate to Moniker with the prospect copied in, so both sides start from the same numbers.",
    stack: ["React", "Firebase", "Flight API", "EmailJS", "SendGrid"],
  },
  {
    client: "Spectronix",
    what: "Website for a vision-systems company",
    detail:
      "The public site for Spectronix's multi-sensor vision systems, which detect events in real time for corrections, policing and healthcare. Rive animations show how the technology works, and the demo requests go out through EmailJS and SendGrid.",
    stack: ["React", "Rive", "Firestore", "CDN", "EmailJS", "SendGrid"],
    href: "https://spectronix.ca",
  },
  {
    client: "UHN",
    what: "Internal tools",
    detail: "",
    stack: [],
  },
];
