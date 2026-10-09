export function TagList({ items, label }: { items: readonly string[]; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-x-2 gap-y-2">
      {items.map((item) => (
        <li key={item} className="rounded-sm bg-paper-sunk px-2 py-0.5 text-sm text-muted">
          {item}
        </li>
      ))}
    </ul>
  );
}
