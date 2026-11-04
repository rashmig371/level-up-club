# Level Up Club

A mobile-first, independent 28-day Amazon L6 / Senior SDE interview practice dashboard. Plain HTML, CSS, and JavaScript; no build step, backend, analytics, external scripts, or account required.

## Use

Open the deployed GitHub Pages site. The initial start date is **November 5, 2026**; change it to shift calendar dates without losing checked tasks or notes. All 28 days remain accessible. The percentage counts **84 practice tasks**, not readiness or hiring probability.

Checked tasks, the start date, and optional per-day plain-text notes stay in versioned browser localStorage (`level-up-club:v1`). The UI reports write failures explicitly; unsaved changes can still be exported. There is **no automatic sync**, and browser-data deletion or private browsing may lose progress. Export regularly, keep backups private, and import on another device to move progress. Imports validate version, exact schema, task IDs, dates, note lengths, and the 512 KB byte limit before asking permission to replace data. An invalid or cancelled import leaves progress unchanged. If another tab changes storage, this tab stops writing until reload to prevent silent overwrites.

The public content is generic preparation only. Do not commit notes, backups, resume content, or personal stories. No fixed Amazon round format is assumed; confirm with your recruiter. Practice guidance is not an Amazon hiring cutoff or a promise of L6 readiness.

## Local development

Serve this directory over HTTP (ES modules require a server):

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`. Run the dependency-free logic tests with `npm test` (Node 18+). Browser acceptance coverage is in `tests/browser.test.cjs`; it needs Playwright available on `NODE_PATH` and an installed Chromium browser. With the server running, execute `node tests\browser.test.cjs`. Set `TEST_URL` to test a different served URL.

The theme follows device preference; `?scoutTheme=light` or `?scoutTheme=dark` can preview either theme. Calendar arithmetic uses UTC date-only stamps and local calendar parts for today's date, avoiding DST and UTC-conversion shifts.

## Deployment

GitHub Pages publishes only the `site` artifact prepared by `.github/workflows/pages.yml`, not tests or private device data. Pushes to `main` run core tests, copy the six public assets, and deploy using GitHub's built-in token. No personal token or repository secret is needed. The workflow has read-only contents access; only its deployment job has Pages write and OIDC permissions.
