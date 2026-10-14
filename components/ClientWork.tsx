import type { ClientEngagement } from "@/content/clientWork";
import { ButtonLink } from "./ButtonLink";
import { TagList } from "./TagList";

export function ClientWork({ engagements }: { engagements: readonly ClientEngagement[] }) {
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
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <p className="prose-measure">
          These are internal tools, so there&rsquo;s nothing public to show. I&rsquo;m happy to walk
          through them on a call.
        </p>
        <ButtonLink href="/contact" variant="quiet">
          Book a walkthrough
        </ButtonLink>
      </div>
    </div>
  );
}
