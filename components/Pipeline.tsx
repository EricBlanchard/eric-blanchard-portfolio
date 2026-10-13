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
      body: "Lighthouse runs against the production build. A score below budget fails the pipeline.",
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

export function Pipeline({ quality }: { quality: QualityReport }) {
  const steps = pipelineSteps(quality);
  return (
    <ol className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <li key={step.title} className="flex flex-col gap-3 bg-paper p-5 sm:p-6">
          <div className="flex items-baseline gap-3">
            <span className="display text-4xl text-spruce" aria-hidden="true">
              {i + 1}
            </span>
            <h3 className="text-lg font-semibold leading-tight">{step.title}</h3>
          </div>
          <p className="text-[0.95rem] text-muted">{step.body}</p>
          <div className="mt-auto flex flex-col gap-3">
            <p className="text-sm">
              <span className="text-muted">Tools: </span>
              {step.tools}
            </p>
            {step.result && (
              <p className="border-t border-line pt-3 text-sm font-semibold tabular-nums">
                {step.result}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
