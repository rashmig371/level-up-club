# Level Up Club

A mobile-first, independent interview practice dashboard with two 28-day tracks. Plain HTML, CSS, and JavaScript; no build step, backend, analytics, external scripts, or account required.

- **Engineering** (default): Amazon L6 / Senior SDE coding, design, and behavioral preparation.
- **Program & business** (`?plan=business`): senior program management, business operations, sales strategy, PMO, transformation, and automotive/industrial consulting. Business cases, Excel/Power BI/relevant VBA/basic SQL, operating mechanisms, writing, and leadership interviews—not software engineering.

The public tracks do not identify their intended users or contain resume details or personal stories.

## Use

Open the deployed GitHub Pages site. The initial start date is **November 5, 2026**; change it to shift calendar dates without losing checked tasks or notes. All 28 days remain accessible. The percentage counts **84 practice tasks**, not readiness or hiring probability.

Checked tasks, the start date, and optional per-day plain-text notes (2,000 characters per day) stay in versioned browser localStorage (`level-up-club:v1` for engineering; `level-up-club:business:v1` for business). Each track has independent progress and rejects the other track's backups, including empty backups. Original engineering version-1 backups remain supported. The note limit ensures even a full export with Unicode or escaped characters fits within the import size limit.

The UI reports write failures explicitly; unsaved changes can still be exported. There is **no automatic sync**, and browser-data deletion or private browsing may lose progress. Export regularly, keep backups private, and import on another device to move progress. Imports validate version, exact schema, task IDs, dates, note lengths, and the 512 KB byte limit before asking permission to replace data. An invalid or cancelled import leaves progress unchanged. If another tab changes storage, this tab stops writing until reload to prevent silent overwrites.

The public content is generic preparation only. Do not commit notes, backups, resume content, or personal stories. No fixed Amazon round format is assumed; confirm with your recruiter. Practice guidance is not an Amazon hiring cutoff or a promise of L6 readiness.

## Local development

Serve this directory over HTTP (ES modules require a server):

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`. Run the dependency-free logic tests with `npm test` (Node 22+). Feed parsing tests run with `python -m unittest discover -s tests -p "*_test.py"` (Python 3.11+). Browser acceptance coverage is in `tests/browser.test.cjs`; it needs Playwright resolvable by Node and an installed Chromium browser. With the server running, execute `node tests\browser.test.cjs`. Set `TEST_URL` to test a different served URL. Include `?plan=business` to run the full suite against the business track as well. The suite also checks cross-track isolation, daily resource coverage, search/filtering, in-app lessons, and news error/staleness behavior.

The theme follows device preference; `?scoutTheme=light` or `?scoutTheme=dark` can preview either theme. Calendar arithmetic uses UTC date-only stamps and local calendar parts for today's date, avoiding DST and UTC-conversion shifts.

## Deployment

GitHub Pages publishes only the `site` artifact prepared by `.github/workflows/pages.yml`, not tests or private device data. Pushes to `main`, manual dispatches, and the daily schedule run tests, prepare public assets, refresh headlines, and deploy using GitHub's built-in token. No personal token or repository secret is needed. The workflow has read-only contents access; only its deployment job has Pages write and OIDC permissions.

Asset URLs and module imports carry a release query (`v=3`) to prevent a browser's cached previous release from mixing incompatible scripts. When changing public assets, increment the marker consistently in `index.html`, `app.js`, `core.js`, `catalog.js`, and `study-ui.js`. The daily `news.json` is fetched same-origin with `cache: "no-store"` independently of the asset release.

## Integrated study hub

Every existing task links to specific practice or references; task IDs and saved-progress schemas are unchanged. `study-content.js` contains 31 named free-tier LeetCode problems, CSES alternatives, official documentation, MIT videos, curated YouTube channels/playlists, and role-specific reading. The library filters by text/type. Original in-app lessons include coding/design canvases, retry and cache exercises, STAR and mock worksheets, program/KPI templates, synthetic profitability/market-entry/pricing/operations cases, an Excel/Power BI/SQL analytics lab, forecasting, and writing scaffolds. Worked checks are collapsed until requested.

The site is the study home base, not a copy of third-party courses: external resources open deliberately in a new tab; no external video embeds, scripts, thumbnails, or trackers load automatically. Access/account/software caveats are shown. LeetCode can block automated requests and generally needs an account for submissions; CSES and in-app exercises provide alternatives. Public Excel/Power BI documentation does not connect the dashboard to a Microsoft account. Some desktop-only tool features cannot execute on mobile.

## Market pulse and freshness

`news-sources.json` specifies public RSS/Atom feeds and allowed HTTPS domains. `scripts\refresh_news.py` downloads bounded feeds at build time, selects up to four items per source from the last 30 days, and writes title, source, link, and publication timestamp—not article bodies. It rejects XML DTD/entity declarations and unsafe/foreign article URLs; Atom timestamps and RSS timezone offsets are normalized to UTC. Amazon announcement titles use an explicitly disclosed relevance keyword filter.

Engineering sources: AWS Architecture, AWS News, GitHub Blog, and Martin Fowler. Business sources: About Amazon, Supply Chain Dive, and Mint Economy. Company announcements, practitioner analysis, and independent reporting are labeled separately. Source-specific discussion prompts help turn reading into interview practice; they are not generated article summaries or fact-checks.

The Pages workflow refreshes daily at **03:17 UTC / 08:47 India time**, as well as on deployment. GitHub may delay schedules or disable them after prolonged repository inactivity; a snapshot older than 36 hours is visibly flagged. “Check for updates” reloads the published snapshot, not remote feeds. Failed sources are labeled and may retain dated items from the committed seed `news.json`; those are explicitly marked earlier snapshots. An empty, failed, malformed, or unavailable feed never appears as live news. The last successful source check and publication dates remain visible. Publisher paywalls and access rules can vary.

Run `python scripts\refresh_news.py` to regenerate the committed seed from real feeds. No API key, account, backend, or client-to-publisher request is needed. The digest is context for interview preparation, not a live financial ticker, investment advice, or a claim about hiring demand.
