import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Pipeline } from "@/components/Pipeline";
import { SectionHeading } from "@/components/SectionHeading";
import { Stat, StatGrid } from "@/components/Stat";
import { site } from "@/content/site";
import { formatCount, formatDate, formatPercent, formatScore, shortCommit } from "@/lib/quality";
import { quality as q } from "@/lib/quality-data";

export const metadata: Metadata = {
  title: "Engineering",
  description:
    "The tests, budgets and pipeline behind this site, with numbers from the build you are looking at.",
  alternates: { canonical: "/engineering" },
};

const aiPractice = [
  {
    title: "Rules live in the repository",
    body: "AGENTS.md and prompt files give every AI session the same conventions a new teammate would get: how to test, what not to touch, where things go.",
  },
  {
    title: "Agents get a narrow job",
    body: "On Hexploration, separate agents handle level design, balance tuning and player feedback, with a coordinator handing work between them.",
  },
  {
    title: "Tools, not pasted context",
    body: "MCP connections let the agent read the Unity scene and the Notion design wiki directly, so it works from the source of truth.",
  },
  {
    title: "CI has the final word",
    body: "AI drafts; it does not approve. Every change, whoever wrote it, passes the same checks below, and I read every diff before it merges.",
  },
];

export default function EngineeringPage() {
  const built = formatDate(q.generatedAt);
  const commit = shortCommit(q.commit);
  return (
    <>
      <Container className="py-14 md:py-20">
        <h1 className="display text-[clamp(3.5rem,11vw,8.5rem)]">Engineering</h1>
        <p className="prose-measure mt-8 text-xl leading-relaxed">
          This site is its own case study. Every number on this page was produced by the pipeline
          run that built and deployed it, so it can only be as good as the code actually is.
        </p>
        <p className="mt-4 text-muted">
          {built ? (
            <>
              Measured {built}
              {commit && (
                <>
                  {" on commit "}
                  <a className="link" href={`${site.links.source}/commit/${q.commit}`}>
                    {commit}
                  </a>
                </>
              )}
              {q.runUrl && (
                <>
                  {". "}
                  <a className="link" href={q.runUrl}>
                    See the pipeline run
                  </a>
                </>
              )}
              .
            </>
          ) : (
            <>This is a local build, so nothing has been measured yet.</>
          )}
        </p>
      </Container>

      <section aria-labelledby="numbers" className="py-12">
        <Container>
          <h2 id="numbers" className="sr-only">
            Measurements
          </h2>
          <StatGrid>
            <Stat
              value={formatScore(q.lighthouse.performance)}
              label="Lighthouse performance"
              note="Budget: 95 or the build fails"
            />
            <Stat
              value={formatScore(q.lighthouse.accessibility)}
              label="Lighthouse accessibility"
              note="Budget: 100"
            />
            <Stat
              value={q.homeJsKb === null ? "–" : `${Math.round(q.homeJsKb)} kB`}
              label="JavaScript on the home page"
              note="Compressed, measured in a real browser. Budget: 150 kB"
            />
            <Stat
              value={formatCount(q.a11y.violations)}
              label="Accessibility violations"
              note={
                q.a11y.pages === null ? undefined : `Across ${q.a11y.pages} pages, light and dark`
              }
            />
            <Stat
              value={formatCount(q.unit.tests)}
              label="Unit and component tests"
              note={q.unit.files === null ? undefined : `In ${q.unit.files} files`}
            />
            <Stat
              value={formatPercent(q.coverage.lines)}
              label="Line coverage"
              note={`Branches ${formatPercent(q.coverage.branches)}, functions ${formatPercent(q.coverage.functions)}`}
            />
            <Stat
              value={formatCount(q.stories.count)}
              label="Storybook stories"
              note={
                q.stories.components === null
                  ? undefined
                  : `Covering ${q.stories.components} components`
              }
            />
            <Stat
              value={formatCount(q.e2e.tests)}
              label="End-to-end checks"
              note="Playwright, Chromium"
            />
          </StatGrid>
          <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <a className="link" href="/storybook/index.html">
                Open the component library
              </a>
            </li>
            <li>
              <a className="link" href="/reports/coverage/index.html">
                Open the coverage report
              </a>
            </li>
            <li>
              <a className="link" href={site.links.source}>
                Read the source
              </a>
            </li>
          </ul>
        </Container>
      </section>

      <section aria-labelledby="pipeline" className="py-16">
        <Container>
          <SectionHeading id="pipeline" title="The pipeline">
            <p>
              GitHub Actions runs these steps in order on every pull request, on every merge, and
              once a week on its own so the site keeps getting patched while I am busy elsewhere.
            </p>
          </SectionHeading>
          <Pipeline quality={q} />
        </Container>
      </section>

      <section aria-labelledby="ai" className="py-16">
        <Container>
          <SectionHeading id="ai" title="AI as a tool">
            <p>
              I use Claude Code daily, including to build this site. Here is how I keep it useful
              and keep it honest.
            </p>
          </SectionHeading>
          <ul className="grid gap-x-10 gap-y-10 md:grid-cols-2">
            {aiPractice.map((item) => (
              <li key={item.title} className="prose-measure">
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="choices" className="py-16">
        <Container>
          <SectionHeading id="choices" title="Choices for speed" />
          <ul className="prose-measure flex list-disc flex-col gap-3 pl-5 marker:text-spruce">
            <li>
              Every page is prerendered. The root layout requires static output, so the build fails
              if anything starts rendering per request.
            </li>
            <li>
              Server Components by default. The hero map is generated on the server as SVG and
              animated with CSS, so it costs no JavaScript.
            </li>
            <li>Two self-hosted variable fonts, preloaded, with no third-party requests.</li>
            <li>Light and dark themes follow your system setting through CSS alone.</li>
            <li>
              Security headers, including a content security policy, are set on every response.
            </li>
          </ul>
        </Container>
      </section>
    </>
  );
}
