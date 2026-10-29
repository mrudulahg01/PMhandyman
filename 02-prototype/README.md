# Customer Journey Friction Radar

A working interactive prototype that answers: **Where are customers struggling most?**

Open `index.html` or `friction-radar.html` directly in a browser. Both are self-contained and work offline, with no installation or API keys.

## Explore

- Four customer journeys: onboarding, checkout, integrations and subscription renewal.
- Five clickable milestones per journey, with step abandonment and cumulative completion.
- Startup, Growth and Enterprise customer segments, plus 7, 30 and 90 day sample periods.
- Deduplicated journey retry/error counts, step-level rates and segment comparisons.
- Fictional support examples linked to the selected milestone and segment.
- A scripted demo assistant that connects observed patterns to hypotheses and proposes experiments with a success metric and guardrail.
- Six example investigations and a browser-saved experiment backlog.
- Exportable sample data snapshots and explicit funnel/metric definitions.

All data is fictional. Counts are deterministic sample aggregates. Support excerpts are illustrative, and explanations are hypotheses rather than proven causes. Funnels are predefined; event mapping and live data ingestion are future work. The demo does not start experiments or contact customers.

## Develop

Requires Node.js. No external packages are needed.

```sh
npm run dev
```

Visit http://localhost:4173. To rebuild the portable file and static deployment files:

```sh
npm run build
npm test
```

Edit `app.js`, `data.js`, `styles.css` and `index.template.html`, then run `npm run build`. The build regenerates the offline entry points `index.html`, `friction-radar.html` and `dist/index.html`. Generated HTML should not be edited directly. Sites hosting configuration is in `.openai/hosting.json`.
