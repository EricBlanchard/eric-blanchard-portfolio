import type { Route } from "next";
import Link from "next/link";
import { Container } from "./Container";

const nav = [
  { href: "/#work", label: "Work" },
  { href: "/engineering", label: "Engineering" },
  { href: "/studio", label: "Studio" },
  { href: "/#contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
        <Link href="/" className="display text-2xl font-extrabold tracking-wide no-underline">
          Eric Blanchard
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href as Route}
                  className="py-2 text-ink no-underline hover:text-spruce hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
