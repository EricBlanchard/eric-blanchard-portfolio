import type { Route } from "next";
import Link from "next/link";
import type { Project } from "@/content/types";

/**
 * One project in the index. The whole row is the link. On hover or keyboard focus a tint
 * fades in behind it, a spruce rule grows down its left edge, the title slides over to make
 * room for an arrow, and the summary darkens. Only opacity, transform and colour change, so
 * the effect stays off the main thread; reduced motion keeps the colour and drops the movement.
 */
export function ProjectRow({ project }: { project: Project }) {
  const lit = "group-hover:opacity-100 group-focus-within:opacity-100";
  return (
    <article className="group relative isolate grid gap-x-8 gap-y-3 border-t border-line py-8 md:grid-cols-12 md:py-10">
      <span
        aria-hidden="true"
        className={`absolute -inset-x-3 inset-y-0 -z-10 bg-paper-sunk opacity-0 transition-opacity duration-300 sm:-inset-x-5 ${lit}`}
      />
      <span
        aria-hidden="true"
        className="absolute inset-y-0 -left-3 w-1 origin-top scale-y-0 bg-spruce transition-transform duration-300 ease-out group-hover:scale-y-100 group-focus-within:scale-y-100 motion-reduce:transition-none sm:-left-5"
      />
      <h3 className="display text-[2.6rem] sm:text-5xl md:col-span-5">
        <Link
          href={`/work/${project.slug}` as Route}
          className="inline-flex items-baseline gap-3 no-underline transition-[color,translate] duration-300 ease-out after:absolute after:inset-0 after:content-[''] group-hover:text-spruce group-focus-within:text-spruce motion-safe:group-hover:translate-x-2 motion-safe:group-focus-within:translate-x-2"
        >
          {project.title}
          <span
            aria-hidden="true"
            className={`-translate-x-3 text-[0.6em] opacity-0 transition-[opacity,translate] duration-300 ease-out group-hover:translate-x-0 group-focus-within:translate-x-0 motion-reduce:translate-x-0 ${lit}`}
          >
            &rarr;
          </span>
        </Link>
      </h3>
      <p className="prose-measure text-muted transition-colors duration-300 group-hover:text-ink group-focus-within:text-ink md:col-span-4 md:pt-1">
        {project.summary}
      </p>
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
