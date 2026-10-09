import { ButtonLink } from "@/components/ButtonLink";
import { Container } from "@/components/Container";
import { HexField } from "@/components/HexField";
import { Pipeline } from "@/components/Pipeline";
import { ProjectIndex } from "@/components/ProjectIndex";
import { SectionHeading } from "@/components/SectionHeading";
import { projects } from "@/content/projects";
import { site, studio } from "@/content/site";
import { quality } from "@/lib/quality-data";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <section aria-labelledby="intro" className="overflow-hidden">
        <Container className="grid items-center gap-10 py-14 md:grid-cols-12 md:py-24">
          <div className="md:col-span-7">
            <h1 id="intro" className="display text-[clamp(4.5rem,14vw,10rem)]">
              Eric
              <br />
              Blanchard
            </h1>
            <p className="prose-measure mt-8 text-xl leading-relaxed">
              I build fast, well-tested software: web apps, data dashboards and games. I run a small
              studio called Deleptual, and I am looking for a remote developer role with a Canadian
              consultancy or a team working in renewable energy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#work">See the work</ButtonLink>
              <ButtonLink href="/engineering" variant="quiet">
                How this site is built
              </ButtonLink>
            </div>
          </div>
          <div className="md:col-span-5">
            <HexField className="mx-auto w-full max-w-md md:max-w-none" />
          </div>
        </Container>
      </section>

      <section aria-labelledby="work" className="scroll-mt-6 py-16">
        <Container>
          <SectionHeading id="work" title="Selected work">
            <p>
              Client work, studio projects and the apps I build for myself. Each one links to a
              write-up of the decisions behind it.
            </p>
          </SectionHeading>
          <ProjectIndex projects={projects} />
        </Container>
      </section>

      <section aria-labelledby="pipeline" className="py-16">
        <Container>
          <SectionHeading id="pipeline" title="How this site ships">
            <p>
              The same pipeline I would bring to your team. The numbers below come from the run that
              built the page you are reading.
            </p>
          </SectionHeading>
          <Pipeline quality={quality} />
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <Link className="link" href="/engineering">
              Read the full quality report
            </Link>
            <a className="link" href="/storybook/index.html">
              Browse the component library
            </a>
            <a className="link" href={site.links.source}>
              View the source on GitHub
            </a>
          </p>
        </Container>
      </section>

      <section aria-labelledby="studio" className="py-16">
        <Container className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 id="studio" className="display text-6xl sm:text-7xl">
              {studio.name}
            </h2>
            <p className="mt-4 text-muted">
              Incorporated in {studio.base}. Running since {studio.founded}.
            </p>
          </div>
          <div className="md:col-span-7">
            <p className="prose-measure text-xl leading-relaxed">{studio.summary}</p>
            <p className="mt-6">
              <Link className="link" href="/studio">
                What the studio does
              </Link>
            </p>
          </div>
        </Container>
      </section>

      <section aria-labelledby="contact" className="scroll-mt-6 py-16">
        <Container>
          <div className="border-t-2 border-ink pt-10">
            <h2 id="contact" className="display text-[clamp(3.5rem,10vw,8rem)]">
              Let’s talk
            </h2>
            <p className="prose-measure mt-6 text-xl leading-relaxed">
              If you are hiring for a remote role, or need a web app built and handed over properly,
              I would like to hear about it.
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {site.email && (
                <li>
                  <ButtonLink href={`mailto:${site.email}`}>Email me</ButtonLink>
                </li>
              )}
              <li>
                <ButtonLink href={site.links.linkedin} variant={site.email ? "quiet" : "primary"}>
                  LinkedIn
                </ButtonLink>
              </li>
              <li>
                <ButtonLink href={site.links.github} variant="quiet">
                  GitHub
                </ButtonLink>
              </li>
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
