import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/content/site";
import { quality } from "@/lib/quality-data";
import { fontVariables } from "./fonts";
import "./globals.css";

/** The whole site is prerendered. The build fails if anything becomes request-time. */
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}, ${site.role.toLowerCase()}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.name, url: site.links.linkedin }],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_CA",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1a2b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-CA" className={fontVariables}>
      <body className="flex min-h-dvh flex-col antialiased">
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter quality={quality} />
      </body>
    </html>
  );
}
