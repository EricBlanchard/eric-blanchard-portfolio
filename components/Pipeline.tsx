import type { QualityReport } from "@/lib/quality";
import { formatCount, formatPercent, formatScore, shortCommit } from "@/lib/quality";

export interface PipelineStep {
  title: string;
  body: string;
  tools: string;
  result: string | null;
}

export function pipelineSteps(q: QualityReport): PipelineStep[] {
  const commit = shortCommit(q.commit);
  return [
    {
      title: "Pull request",
      body: "Every change arrives as a pull request, including the automated dependency updates.",
      tools: "GitHub",
      result: null,
    },
    {
      title: "Static checks",
      body: "Strict TypeScript, ESLint and Prettier. Nothing else runs until these pass.",
      tools: "TypeScript, ESLint",
      result: null,
    },
    {
      title: "Unit and component tests",
      body: "Logic is tested in isolation; components are tested by rendering their stories in a real browser.",
      tools: "Vitest, Testing Library",
      result:
        q.unit.tests === null
          ? null
          : `${formatCount(q.unit.tests)} tests, ${formatPercent(q.coverage.lines)} line coverage`,
    },
    {
      title: "Storybook",
      body: "Each component is documented with its states, and every story doubles as an accessibility test.",
      tools: "Storybook, axe",
      result: q.stories.count === null ? null : `${formatCount(q.stories.count)} stories`,
    },
    {
      title: "End to end",
      body: "Every page is loaded in Chromium, navigated, and scanned for accessibility problems.",
      tools: "Playwright, axe",
      result:
        q.e2e.tests === null
          ? null
          : `${formatCount(q.e2e.tests)} checks, ${formatCount(q.a11y.violations)} accessibility violations`,
    },
    {
      title: "Performance budget",
      body: "Lighthouse runs against the production build, with its CPU slowdown calibrated to the machine so every run simulates the same phone. A score below budget fails the pipeline.",
      tools: "Lighthouse",
      result:
        q.lighthouse.performance === null
          ? null
          : `Performance ${formatScore(q.lighthouse.performance)}, accessibility ${formatScore(q.lighthouse.accessibility)}`,
    },
    {
      title: "Deploy",
      body: "Pull requests get a preview URL. Merges to main go to production on Netlify.",
      tools: "GitHub Actions, Netlify",
      result: commit ? `Live build ${commit}` : null,
    },
    {
      title: "Stay current",
      body: "Dependabot proposes updates weekly. Patches and minor versions merge themselves once everything above is green.",
      tools: "Dependabot, CodeQL",
      result: null,
    },
  ];
}

/** The pipeline as a numbered list: one row per step, with its tools and live result. */
export function Pipeline({ quality }: { quality: QualityReport }) {
  const steps = pipelineSteps(quality);
  return (
    <ol className="border-b border-line">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="grid grid-cols-[3rem_1fr] gap-x-4 gap-y-3 border-t border-line py-6 sm:grid-cols-[4rem_1fr] md:grid-cols-12 md:gap-x-8"
        >
          <span
            className="display text-4xl leading-none text-spruce tabular-nums md:col-span-1"
            aria-hidden="true"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="flex flex-col gap-1 md:col-span-7">
            <h3 className="text-lg font-semibold leading-tight">{step.title}</h3>
            <p className="prose-measure text-muted">{step.body}</p>
          </div>
          <div className="col-start-2 flex flex-col gap-1 text-sm md:col-span-4 md:col-start-auto">
            <p>
              <span className="text-muted">Tools: </span>
              {step.tools}
            </p>
            {step.result && <p className="font-semibold tabular-nums">{step.result}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
