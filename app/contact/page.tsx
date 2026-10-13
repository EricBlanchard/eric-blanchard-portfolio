import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Container } from "@/components/Container";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send Eric Blanchard a message about a remote developer role or a web project for Deleptual.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Container className="grid gap-12 py-14 md:grid-cols-12 md:py-20">
      <div className="md:col-span-5">
        <h1 className="display text-[clamp(3.5rem,11vw,8.5rem)]">Contact</h1>
        <p className="prose-measure mt-8 text-xl leading-relaxed">
          Hiring for a remote role, or need a web app built and handed over properly? Tell me a
          little about it and I&rsquo;ll get back to you.
        </p>
        <dl className="mt-10 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
          <dt className="text-muted">Email</dt>
          <dd>
            <a className="link break-all" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </dd>
          <dt className="text-muted">LinkedIn</dt>
          <dd>
            <a className="link" href={site.links.linkedin}>
              blanchard-eric
            </a>
          </dd>
          <dt className="text-muted">GitHub</dt>
          <dd>
            <a className="link" href={site.links.github}>
              EricBlanchard
            </a>
          </dd>
          <dt className="text-muted">Based in</dt>
          <dd>{site.location}</dd>
        </dl>
      </div>
      <div className="md:col-span-6 md:col-start-7 md:pt-4">
        <ContactForm email={site.email} />
      </div>
    </Container>
  );
}
