import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "quiet";
  /** Opens off-site links in the same tab but marks them as external for assistive tech. */
  external?: boolean;
}

const styles = {
  primary: "bg-ink text-paper hover:bg-spruce border-ink hover:border-spruce",
  quiet: "border-line text-ink hover:border-ink",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
}: ButtonLinkProps) {
  const className = `inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-5 py-2 font-semibold transition-colors ${styles[variant]}`;
  if (external || /^(https?:|mailto:)/.test(href)) {
    return (
      <a href={href} className={className} rel="noopener">
        {children}
      </a>
    );
  }
  return (
    <Link href={href as Route} className={className}>
      {children}
    </Link>
  );
}
