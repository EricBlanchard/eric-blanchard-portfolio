import type { Metadata, Route } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { ClientWork } from "@/components/ClientWork";
import { Container } from "@/components/Container";
import { clientWork } from "@/content/clientWork";
import { projects } from "@/content/projects";
import { studio } from "@/content/site";

export const metadata: Metadata = {
  title: "Deleptual",
  description: studio.summary,
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  const studioWork = projects.filter((p) => p.kind === "Studio");
  return (
    <>
      <Container className="py-14 md:py-20">
        <h1 className="display text-[clamp(3.5rem,13vw,10rem)]">{studio.name}</h1>
        <div className="mt-8 grid gap-10 md:grid-cols-12">
          <p className="prose-measure text-xl leading-relaxed md:col-span-7">{studio.summary}</p>
          <dl className="grid grid-cols-[auto_1fr] content-start gap-x-4 gap-y-2 md:col-span-4 md:col-start-9">
            <dt className="text-muted">Founded</dt>
            <dd>{studio.founded}</dd>
            <dt className="text-muted">Based in</dt>
            <dd>{studio.base}</dd>
            <dt className="text-muted">Website</dt>
            <dd>
              <a className="link" href={studio.url}>
                deleptual.ca
              </a>
            </dd>
          </dl>
        </div>
      </Container>

      <section aria-labelledby="practice" className="border-t border-line py-14">
        <Container>
          <h2 id="practice" className="display mb-10 text-5xl sm:text-6xl">
            What the studio does
          </h2>
          <ul className="grid gap-10 md:grid-cols-3">
            {studio.practice.map((item) => (
              <li key={item.title}>
                <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="studio-clients" className="border-t border-line py-14">
        <Container>
          <h2 id="studio-clients" className="display mb-10 text-5xl sm:text-6xl">
            Client work
          </h2>
          <ClientWork engagements={clientWork} />
        </Container>
      </section>

      <section aria-labelledby="studio-work" className="border-t border-line py-14">
        <Container>
          <h2 id="studio-work" className="display mb-8 text-5xl sm:text-6xl">
            Studio projects
          </h2>
          <ul className="flex flex-col gap-4">
            {studioWork.map((p) => (
              <li key={p.slug}>
                <Link
                  className="display text-4xl hover:text-spruce"
                  href={`/work/${p.slug}` as Route}
                >
                  {p.title}
                </Link>
                <p className="prose-measure text-muted">{p.summary}</p>
              </li>
            ))}
          </ul>
          <div className="mt-12">
            <ButtonLink href={studio.url}>Visit deleptual.ca</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
