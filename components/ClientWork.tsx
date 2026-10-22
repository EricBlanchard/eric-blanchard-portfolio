import type { ClientEngagement } from "@/content/clientWork";
import { ButtonLink } from "./ButtonLink";
import { TagList } from "./TagList";

export function ClientWork({
  engagements,
  showNote = true,
}: {
  engagements: readonly ClientEngagement[];
  /** The line explaining why there's nothing to show; turn off when the intro already says it. */
  showNote?: boolean;
}) {
  return (
    <div>
      <ul className="border-b border-line">
        {engagements.map((e) => (
          <li
            key={e.client}
            className="grid gap-x-8 gap-y-3 border-t border-line py-8 md:grid-cols-12"
          >
            <div className="md:col-span-4">
              <h3 className="display text-4xl">{e.client}</h3>
              <p className="mt-1 font-semibold">{e.what}</p>
            </div>
            <div className="flex flex-col gap-4 md:col-span-8">
              {e.detail && <p className="prose-measure text-muted">{e.detail}</p>}
              {e.stack.length > 0 && <TagList items={e.stack} label={`${e.client} technology`} />}
              {e.href && (
                <p>
                  <a className="link" href={e.href}>
                    Visit {new URL(e.href).hostname.replace(/^www\./, "")}
                  </a>
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        {showNote && (
          <p className="prose-measure">
            Most of these are internal tools, so there&rsquo;s nothing public to show. I&rsquo;m
            happy to walk through them on a call.
          </p>
        )}
        <ButtonLink href="/contact" variant="quiet">
          Book a walkthrough
        </ButtonLink>
      </div>
    </div>
  );
}
