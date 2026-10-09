export type ProjectKind = "Client work" | "Studio" | "Personal" | "Workflow";

export type ProjectStatus = "Live" | "In development" | "In use" | "Private";

/** A block of a case study. Kept deliberately small so the content stays plain data. */
export type CaseStudyBlock =
  | { type: "text"; heading: string; body: string[] }
  | { type: "list"; heading: string; intro?: string; items: string[] }
  | {
      type: "table";
      heading: string;
      intro?: string;
      columns: string[];
      rows: string[][];
    };

export interface Screenshot {
  /** Path under /public, e.g. /work/daric/today.png */
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  title: string;
  kind: ProjectKind;
  status: ProjectStatus;
  /** Free text so "2019–present" and "2026" both work. */
  years: string;
  role: string;
  /** One sentence for the index. */
  summary: string;
  /** A short paragraph that opens the case study. */
  lede: string;
  stack: string[];
  /** The engineering decisions worth a reviewer's attention. */
  highlights: string[];
  caseStudy: CaseStudyBlock[];
  screenshots: Screenshot[];
  links: ProjectLink[];
  /** Sectors this project speaks to, used to order the index for a given audience. */
  relevance: Array<"energy" | "consulting" | "games" | "product">;
}
