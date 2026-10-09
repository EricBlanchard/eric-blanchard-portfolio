export interface StatProps {
  value: string;
  label: string;
  /** Short context shown under the label, e.g. the budget. */
  note?: string;
}

export function Stat({ value, label, note }: StatProps) {
  return (
    <div className="flex flex-col gap-1 border-t-2 border-ink pt-3">
      <dt className="order-2 font-semibold">{label}</dt>
      <dd className="display order-1 text-6xl tabular-nums">{value}</dd>
      {note && <dd className="order-3 text-sm text-muted">{note}</dd>}
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">{children}</dl>;
}
