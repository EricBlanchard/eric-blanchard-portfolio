// Written by `npm run screenshots:import`. Edit screenshots/shots.json instead.
import type { Screenshot } from "./types";

export const generatedScreenshots: Record<string, Screenshot[]> = {
  "fleet-pulse": [
    {
      "src": "/work/fleet-pulse/headline-numbers.webp",
      "alt": "Executive headline numbers for the month to date: revenue and energy against budget, the month-end forecast and capacity online.",
      "width": 2274,
      "height": 328,
      "device": "desktop",
      "caption": "Executive: the month at a glance, against budget."
    },
    {
      "src": "/work/fleet-pulse/budget-bridge.webp",
      "alt": "A waterfall chart bridging budgeted revenue to actual revenue, splitting the gap into weather and operational causes.",
      "width": 882,
      "height": 1340,
      "device": "desktop",
      "caption": "Budget to actual: how much of the gap was weather, and how much was operations."
    },
    {
      "src": "/work/fleet-pulse/revenue-vs-budget.webp",
      "alt": "Cumulative revenue for the month plotted against the P50 budget line, with a forecast to month end.",
      "width": 1346,
      "height": 1340,
      "device": "desktop",
      "caption": "Revenue against a P50 budget, with a month-end forecast."
    },
    {
      "src": "/work/fleet-pulse/fleet-map.webp",
      "alt": "Map of solar and battery sites across Canada and the US, each circle sized by the revenue the site has lost.",
      "width": 2274,
      "height": 1206,
      "device": "desktop",
      "caption": "Asset manager: the fleet map, circles sized by lost revenue."
    },
    {
      "src": "/work/fleet-pulse/revenue-lost.webp",
      "alt": "Breakdown of lost revenue by cause: inverter outages, curtailment, soiling, and offline or degraded strings.",
      "width": 882,
      "height": 964,
      "device": "desktop",
      "caption": "Where the revenue went, by cause."
    },
    {
      "src": "/work/fleet-pulse/next-actions.webp",
      "alt": "Recommended actions for the asset manager: which sites to wash and which faults to investigate, with what each is worth.",
      "width": 2400,
      "height": 2501,
      "device": "desktop",
      "caption": "What to do next: wash, wait or investigate, priced in dollars."
    },
    {
      "src": "/work/fleet-pulse/performance-heatmap.webp",
      "alt": "Heatmap of the performance index for every site and day of the selected range.",
      "width": 2274,
      "height": 1182,
      "device": "desktop",
      "caption": "PV engineer: performance index for every site and day."
    },
    {
      "src": "/work/fleet-pulse/shortfall.webp",
      "alt": "For each site, the gap between expected and actual energy split into loss causes, including the part the model can't explain.",
      "width": 2400,
      "height": 1978,
      "device": "desktop",
      "caption": "Where each site's shortfall goes, including what the model can't explain."
    },
    {
      "src": "/work/fleet-pulse/dispatch-queue.webp",
      "alt": "The operations dispatch queue: equipment problems ranked by revenue at stake per day, marked as still down or recovered.",
      "width": 2400,
      "height": 1637,
      "device": "desktop",
      "caption": "Operations: the dispatch queue, ranked by revenue at stake."
    },
    {
      "src": "/work/fleet-pulse/soiling-rain.webp",
      "alt": "One site's daily losses to soiling shown alongside daily rainfall.",
      "width": 2274,
      "height": 974,
      "device": "desktop",
      "caption": "One site: soiling losses against rainfall."
    },
    {
      "src": "/work/fleet-pulse/right-now-phone.webp",
      "alt": "The operations view's headline numbers on a phone: problems to act on now with the revenue at stake, inverters down, strings offline and inverters not reporting.",
      "width": 670,
      "height": 1010,
      "device": "phone",
      "caption": "The dashboards work on a phone too."
    }
  ]
};
