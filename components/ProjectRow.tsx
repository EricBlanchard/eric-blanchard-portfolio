import type { Route } from "next";
import Link from "next/link";
import type { Project } from "@/content/types";

export function ProjectRow({ project }: { project: Project }) {
  return (
    <article className="group relative grid gap-x-8 gap-y-3 border-t border-line py-8 md:grid-cols-12 md:py-10">
      <h3 className="display text-[2.6rem] sm:text-5xl md:col-span-5">
        <Link
          href={`/work/${project.slug}` as Route}
          className="no-underline after:absolute after:inset-0 after:content-[''] group-hover:text-spruce"
        >
          {project.title}
        </Link>
      </h3>
      <p className="prose-measure text-muted md:col-span-4 md:pt-1">{project.summary}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-sm md:col-span-3 md:pt-1.5">
        <dt className="text-muted">Type</dt>
        <dd>{project.kind}</dd>
        <dt className="text-muted">Status</dt>
        <dd>{project.status}</dd>
        <dt className="text-muted">When</dt>
        <dd>{project.years}</dd>
      </dl>
    </article>
  );
}
