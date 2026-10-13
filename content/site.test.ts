import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "./site";

describe("resolveSiteUrl", () => {
  it("uses the first valid URL", () => {
    expect(resolveSiteUrl(["https://ericblanchard.ca", "https://x.netlify.app"])).toBe(
      "https://ericblanchard.ca",
    );
  });

  it("skips an empty value, which is what an unset GitHub variable becomes", () => {
    expect(resolveSiteUrl(["", "https://x.netlify.app"])).toBe("https://x.netlify.app");
    expect(resolveSiteUrl(["   ", undefined])).toBe("http://localhost:3000");
  });

  it("skips values that are not http(s) URLs", () => {
    expect(resolveSiteUrl(["ericblanchard.ca", "ftp://example.com"])).toBe("http://localhost:3000");
  });

  it("normalises to the origin, dropping paths and trailing slashes", () => {
    expect(resolveSiteUrl(["https://ericblanchard.ca/some/path/"])).toBe(
      "https://ericblanchard.ca",
    );
  });

  it("falls back to localhost when nothing is set", () => {
    expect(resolveSiteUrl([])).toBe("http://localhost:3000");
  });
});
