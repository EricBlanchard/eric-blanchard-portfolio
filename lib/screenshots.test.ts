import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  missingAlt,
  outputWidth,
  applyRedactions,
  inferDevice,
  parseInboxPath,
  planInbox,
  redactionPairs,
  slugify,
  resolvePath,
  shotListProblems,
  shotUrl,
  viewportFor,
  type ShotList,
} from "./screenshots";

const committed = JSON.parse(readFileSync("screenshots/shots.json", "utf8")) as ShotList;

describe("the committed shot list", () => {
  it("is valid", () => {
    expect(shotListProblems(committed)).toEqual([]);
  });

  it("never publishes Daric's private screens", () => {
    const shots = committed.apps.daric?.shots ?? [];
    const where = shots.flatMap((s) => [s.path ?? "", s.source ?? ""]).join(" ");
    expect(where).not.toMatch(/people|weight|gym|notes|today|home|groceries|tasks|sign-in/);
  });

  it("captures Fleet Pulse panels with data, not page headers", () => {
    const shots = committed.apps["fleet-pulse"]?.shots ?? [];
    expect(shots.length).toBeGreaterThan(0);
    for (const shot of shots) expect(shot.section, shot.file).toBeTruthy();
  });

  it("keeps studio simulator captures to public pages", () => {
    expect(committed.apps["studio-simulator"]?.signIn).toBe(false);
  });
});

describe("shotListProblems", () => {
  const app = (shots: ShotList["apps"][string]["shots"], manual = false) => ({
    apps: { demo: { baseUrl: "", signIn: false, manual, shots } },
  });

  it("flags bad names, duplicates, devices and paths", () => {
    const problems = shotListProblems(
      app([
        { file: "Home Page", path: "/", device: "desktop", alt: "x" },
        { file: "a", path: "/", device: "desktop", alt: "x" },
        { file: "a", path: "/", device: "desktop", alt: "x" },
        { file: "b", path: "/", device: "tablet" as never, alt: "x" },
        { file: "c", path: "no-slash", device: "phone", alt: "x" },
      ]),
    );
    expect(problems).toHaveLength(4);
    expect(problems.join("\n")).toMatch(/lowercase/);
    expect(problems.join("\n")).toMatch(/used twice/);
    expect(problems.join("\n")).toMatch(/"desktop" or "phone"/);
    expect(problems.join("\n")).toMatch(/start with "\/"/);
  });

  it("rejects an empty section, and section with fullPage", () => {
    const problems = shotListProblems(
      app([
        { file: "a", path: "/", device: "desktop", alt: "x", section: " " },
        { file: "b", path: "/", device: "desktop", alt: "x", section: "Map", fullPage: true },
      ]),
    );
    expect(problems).toEqual([
      "demo/a: section can't be empty.",
      "demo/b: use section or fullPage, not both.",
    ]);
  });

  it("checks widths", () => {
    const problems = shotListProblems(
      app([
        { file: "a", path: "/", device: "desktop", alt: "x", width: 100 },
        { file: "b", path: "/", device: "desktop", alt: "x", width: 1920.5 },
        { file: "c", path: "/", device: "desktop", alt: "x", width: 1920 },
      ]),
    );
    expect(problems).toHaveLength(2);
  });

  it("doesn't need paths for manual shots", () => {
    expect(shotListProblems(app([{ file: "world", device: "desktop", alt: "" }], true))).toEqual(
      [],
    );
  });
});

describe("missingAlt", () => {
  it("requires alt text", () => {
    expect(missingAlt("x", { file: "a", device: "phone", alt: " " })).toMatch(/write alt text/);
    expect(missingAlt("x", { file: "a", device: "phone", alt: "A list." })).toBeNull();
  });
});

describe("resolvePath and shotUrl", () => {
  it("fills placeholders and encodes them", () => {
    expect(resolvePath("/contests/{id}/log", { id: "a b" })).toBe("/contests/a%20b/log");
    expect(resolvePath("/today")).toBe("/today");
  });

  it("explains a missing placeholder", () => {
    expect(() => resolvePath("/contests/{contestId}", {})).toThrow("Set vars.contestId");
  });

  it("joins base and path cleanly", () => {
    expect(shotUrl("https://a.example/", "/demo")).toBe("https://a.example/demo");
    expect(shotUrl("https://a.example", "/?view=x")).toBe("https://a.example/?view=x");
    expect(() => shotUrl("", "/")).toThrow("Set baseUrl");
  });
});

describe("viewportFor", () => {
  it("uses the device size unless a width is given", () => {
    expect(viewportFor({ device: "phone" })).toEqual({ width: 390, height: 844 });
    expect(viewportFor({ device: "desktop", width: 1920 })).toEqual({ width: 1920, height: 900 });
  });
});

describe("outputWidth", () => {
  it("caps and never enlarges", () => {
    expect(outputWidth("desktop", 2880)).toBe(2400);
    expect(outputWidth("phone", 780)).toBe(780);
    expect(outputWidth("phone", 600)).toBe(600);
  });
});

describe("redactions", () => {
  it("replaces longer names first", () => {
    const pairs = redactionPairs({ Ann: "Bea", "Ann Lee": "Cal Moe" });
    expect(pairs.map(([from]) => from)).toEqual(["Ann Lee", "Ann"]);
    expect(applyRedactions("Ann Lee and Ann", pairs)).toBe("Cal Moe and Bea");
  });

  it("drops blank names", () => {
    expect(redactionPairs({ "": "x", " ": "y" })).toEqual([]);
    expect(applyRedactions("hello", [])).toBe("hello");
  });
});

describe("parseInboxPath", () => {
  it("reads the app folder, order, name and device folder", () => {
    expect(parseInboxPath("steps/mobile/03-contest-leaderboard.png")).toEqual({
      folder: "steps",
      order: 3,
      name: "contest-leaderboard",
      device: "phone",
    });
    expect(parseInboxPath("Daric/10b-Weight Chart.PNG")).toMatchObject({
      folder: "daric",
      order: 10,
      name: "weight-chart",
      device: null,
    });
    expect(parseInboxPath("fleet-pulse/fleet-map.png")).toMatchObject({
      order: null,
      name: "fleet-map",
    });
  });
});

describe("slugify and inferDevice", () => {
  it("makes valid file names", () => {
    expect(slugify("  Log Steps (v2) ")).toBe("log-steps-v2");
  });

  it("trusts a device folder, otherwise goes by width", () => {
    expect(inferDevice("desktop", 600)).toBe("desktop");
    expect(inferDevice(null, 749)).toBe("phone");
    expect(inferDevice(null, 2880)).toBe("desktop");
  });
});

describe("planInbox", () => {
  const list: ShotList = {
    apps: {
      "step-contest": {
        baseUrl: "",
        signIn: false,
        manual: true,
        folders: ["steps"],
        skip: ["steps/mobile/09-settings.png"],
        shots: [
          {
            file: "leaderboard",
            source: "steps/desktop/03-leaderboard.png",
            device: "desktop",
            alt: "x",
          },
        ],
      },
      "fleet-pulse": {
        baseUrl: "https://example.com",
        signIn: false,
        shots: [{ file: "fleet-map", path: "/", device: "desktop", alt: "x" }],
      },
    },
  };
  const img = (path: string, width = 780) => ({ path, width, height: 1600 });
  const plan = planInbox(list, [
    img("steps/mobile/10-new-contest.png"),
    img("steps/mobile/03-leaderboard.png"),
    img("steps/desktop/03-leaderboard.png", 2880),
    img("steps/desktop/07-my-log.png", 2880),
    img("steps/mobile/09-settings.png"),
    img("fleet-pulse/fleet-map.png", 2274),
    img("holiday/beach.png"),
  ]);

  it("matches shots by source, or by name in the app's folder", () => {
    expect(plan.sources.get("step-contest/leaderboard")).toBe("steps/desktop/03-leaderboard.png");
    expect(plan.sources.get("fleet-pulse/fleet-map")).toBe("fleet-pulse/fleet-map.png");
  });

  it("adds the rest in folder and number order, without alt text", () => {
    expect(plan.added["step-contest"]).toEqual([
      {
        file: "my-log",
        source: "steps/desktop/07-my-log.png",
        device: "desktop",
        alt: "",
        caption: "",
      },
      {
        file: "leaderboard-phone",
        source: "steps/mobile/03-leaderboard.png",
        device: "phone",
        alt: "",
        caption: "",
      },
      {
        file: "new-contest",
        source: "steps/mobile/10-new-contest.png",
        device: "phone",
        alt: "",
        caption: "",
      },
    ]);
    expect(plan.added["fleet-pulse"]).toBeUndefined();
  });

  it("leaves skipped images alone and reports folders that match no app", () => {
    const sources = plan.added["step-contest"]!.map((s) => s.source);
    expect(sources).not.toContain("steps/mobile/09-settings.png");
    expect(plan.unknown).toEqual(["holiday/beach.png"]);
  });

  it("is valid input for the shot list once alt text is written", () => {
    const shots = plan.added["step-contest"]!.map((s) => ({ ...s, alt: "described" }));
    const next = {
      apps: { ...list.apps, "step-contest": { ...list.apps["step-contest"]!, shots } },
    };
    expect(shotListProblems(next)).toEqual([]);
  });
});

describe("shot sources", () => {
  it("must stay inside the inbox and be an image", () => {
    const app = (source: string) => ({
      apps: {
        a: {
          baseUrl: "",
          signIn: false,
          shots: [{ file: "x", source, device: "phone" as const, alt: "y" }],
        },
      },
    });
    expect(shotListProblems(app("steps/mobile/01-home.png"))).toEqual([]);
    expect(shotListProblems(app("../secret.png"))).toHaveLength(1);
    expect(shotListProblems(app("steps/../../x.png"))).toHaveLength(1);
    expect(shotListProblems(app("/abs.png"))).toHaveLength(1);
    expect(shotListProblems(app("notes.txt"))).toHaveLength(1);
  });
});
