# Repository Guidelines

## Architecture

Pipeline Pulse CRM is a static client-side dashboard for reviewing open pipeline, account health, and deal risk.

- `data/crm.json` contains the local CRM fixture data used by the dashboard.
- `src/crm.js` contains business logic for scoring risk, assigning forecast categories, filtering owner books, and building account snapshots.
- `src/main.js` loads CRM data and renders the browser UI.
- `src/styles.css` contains application styling.
- `test/crm.test.js` covers CRM business logic with Node's built-in test runner.

## Engineering Rules

- Keep pipeline calculations deterministic and explainable.
- Put reusable sales-operations logic in `src/crm.js`; keep `src/main.js` focused on rendering and browser events.
- Add or update tests for changes to risk scoring, forecast categories, owner filters, account snapshots, or pipeline summaries.
- Prefer data-shape changes in `data/crm.json` over hardcoded special cases in UI code.
- When starting a new feature on the codebase, start with the `features/template` folder, create a new subfolder under `features/` named for the feature, copy the template files into it, and iterate with the user on the details.
- Do not introduce external services, API keys, or network-dependent runtime behavior.
- Preserve the no-build setup unless a feature clearly requires a build step.

## Product Rules

- Risk labels should help sales managers find deals that need attention, not punish every imperfect deal.
- Forecast categories should remain easy to explain: `Commit`, `Best Case`, `Pipeline`, and `At Risk`.
- Account health and opportunity risk are related but separate concepts.
- Owner filters should affect pipeline metrics, opportunities, accounts, and tasks consistently.
- Any recommendation feature should expose why the recommendation was made.

## Verification

Run the relevant checks before handing off changes:

```bash
npm test
```

For UI changes, run the app locally and verify the dashboard still loads:

```bash
npm run dev
```
