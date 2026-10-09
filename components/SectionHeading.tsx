import type { ReactNode } from "react";

export function SectionHeading({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-10 grid gap-4 md:grid-cols-12 md:items-end">
      <h2 id={id} className="display text-6xl sm:text-7xl md:col-span-6">
        {title}
      </h2>
      {children && <div className="prose-measure text-muted md:col-span-6 md:pb-2">{children}</div>}
    </div>
  );
}
