/**
 * Client work. These are internal tools, so there's nothing public to link to or
 * screenshot; each entry offers a walkthrough on a call instead.
 */
export interface ClientEngagement {
  client: string;
  what: string;
  /** Leave empty to keep the entry to one line. */
  detail: string;
  stack: string[];
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
      "Turns a prospect's retreat plans into a budget, then emails the estimate to Moniker with the prospect copied in, so both sides start from the same numbers.",
    stack: ["JavaScript", "EmailJS", "SendGrid"],
  },
  {
    client: "UHN",
    what: "Internal tools",
    detail: "",
    stack: [],
  },
];
