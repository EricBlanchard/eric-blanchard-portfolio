import { ButtonLink } from "@/components/ButtonLink";
import { Container } from "@/components/Container";
import { HexField } from "@/components/HexField";

export default function NotFound() {
  return (
    <Container className="grid items-center gap-10 py-20 md:grid-cols-2">
      <div>
        <h1 className="display text-8xl">Off the map</h1>
        <p className="mt-6 text-xl">
          There is no page at this address. It may have moved, or the link may be mistyped.
        </p>
        <div className="mt-8">
          <ButtonLink href="/">Go to the home page</ButtonLink>
        </div>
      </div>
      <HexField cols={6} rows={6} seed={42} className="w-full max-w-xs" />
    </Container>
  );
}
