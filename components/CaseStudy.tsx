import type { CaseStudyBlock } from "@/content/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CaseStudy({ blocks }: { blocks: readonly CaseStudyBlock[] }) {
  return (
    <div className="flex flex-col gap-14">
      {blocks.map((block) => {
        const id = slugify(block.heading);
        return (
          <section key={block.heading} aria-labelledby={id} className="prose-measure">
            <h2 id={id} className="display mb-4 text-4xl">
              {block.heading}
            </h2>
            {block.type === "text" &&
              block.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            {block.type === "list" && (
              <>
                {block.intro && <p className="mb-4">{block.intro}</p>}
                <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-spruce">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}
            {block.type === "table" && (
              <>
                {block.intro && <p className="mb-4">{block.intro}</p>}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-[0.95rem]">
                    <thead>
                      <tr>
                        {block.columns.map((col) => (
                          <th
                            key={col}
                            scope="col"
                            className="border-b-2 border-ink py-2 pr-4 font-semibold"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row) => (
                        <tr key={row[0]} className="border-b border-line">
                          {row.map((cell, i) =>
                            i === 0 ? (
                              <th key={cell} scope="row" className="py-2 pr-4 font-semibold">
                                {cell}
                              </th>
                            ) : (
                              <td key={cell} className="py-2 pr-4 text-muted">
                                {cell}
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
