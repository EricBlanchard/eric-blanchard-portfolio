import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { CaseStudy } from "@/components/CaseStudy";
import { Container } from "@/components/Container";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { TagList } from "@/components/TagList";
import { getNextProject, getProject, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
  };
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = getNextProject(project.slug);

  return (
    <article>
      <Container className="py-14 md:py-20">
        <p className="mb-6">
          <Link className="link" href="/#work">
            All work
          </Link>
        </p>
        <h1 className="display text-[clamp(3.5rem,11vw,8.5rem)]">{project.title}</h1>
        <div className="mt-10 grid gap-10 md:grid-cols-12">
          <p className="prose-measure text-xl leading-relaxed md:col-span-7">{project.lede}</p>
          <dl className="grid grid-cols-[auto_1fr] content-start gap-x-4 gap-y-2 text-[0.95rem] md:col-span-4 md:col-start-9">
            <dt className="text-muted">Type</dt>
            <dd>{project.kind}</dd>
            <dt className="text-muted">Status</dt>
            <dd>{project.status}</dd>
            <dt className="text-muted">When</dt>
            <dd>{project.years}</dd>
            <dt className="text-muted">Role</dt>
            <dd>{project.role}</dd>
          </dl>
        </div>
        <div className="mt-10">
          <TagList items={project.stack} label="Technology" />
        </div>
        {project.links.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-3">
            {project.links.map((link) => (
              <li key={link.href}>
                <ButtonLink href={link.href} variant="quiet">
                  {link.label}
                </ButtonLink>
              </li>
            ))}
          </ul>
        )}
      </Container>

      <Container>
        <div className="grid gap-14 border-t border-line pt-14 md:grid-cols-12">
          <section aria-labelledby="decisions" className="md:col-span-5">
            <h2 id="decisions" className="display mb-6 text-4xl">
              Decisions worth a look
            </h2>
            <ul className="flex flex-col gap-5">
              {project.highlights.map((item) => (
                <li key={item} className="border-l-2 border-spruce pl-4">
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <div className="md:col-span-6 md:col-start-7">
            <CaseStudy blocks={project.caseStudy} />
          </div>
        </div>
      </Container>

      {project.screenshots.length > 0 && (
        <Container className="mt-20">
          <h2 className="display mb-8 text-4xl">Screens</h2>
          <ScreenshotGallery shots={project.screenshots} />
        </Container>
      )}

      <Container className="mt-24">
        <Link
          href={`/work/${next.slug}` as Route}
          className="group block border-t-2 border-ink pt-6 no-underline"
        >
          <span className="text-muted">Next project</span>
          <span className="display mt-2 block text-5xl group-hover:text-spruce sm:text-6xl">
            {next.title}
          </span>
        </Link>
      </Container>
    </article>
  );
}
