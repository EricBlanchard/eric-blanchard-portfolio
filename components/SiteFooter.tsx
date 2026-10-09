import Link from "next/link";
import { site } from "@/content/site";
import type { QualityReport } from "@/lib/quality";
import { formatDate, shortCommit } from "@/lib/quality";
import { Container } from "./Container";

export function SiteFooter({ quality }: { quality: QualityReport }) {
  const commit = shortCommit(quality.commit);
  const built = formatDate(quality.generatedAt);
  const year = quality.generatedAt?.slice(0, 4);
  return (
    <footer className="mt-24 border-t border-line text-sm text-muted">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year ? `${year} ` : ""}
          {site.name}. Built with Next.js, tested in CI, deployed to Netlify.
        </p>
        <p>
          {built ? <>Last built {built}</> : <>Local build</>}
          {commit && (
            <>
              {" from "}
              <a className="link" href={`${site.links.source}/commit/${quality.commit}`}>
                {commit}
              </a>
            </>
          )}
          {". "}
          <Link className="link" href="/engineering">
            Quality report
          </Link>
        </p>
      </Container>
    </footer>
  );
}
