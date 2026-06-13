# hk-vanishing-trades

> **🔗 Live: https://hk-vanishing-trades.pages.dev**

"Which industries are disappearing in Hong Kong?" — using Census & Statistics Department (C&SD, via data.gov.hk) open data to quantify which industries are shrinking on both employment and establishment counts, told as an interactive data story.

## How it decides "disappearing"

For each industry, it takes ~20-year time series of **employment** and **number of establishments**:

- Computes the **CAGR** (compound annual growth rate) of each.
- Counts as "shrinking" only when **both indicators decline together**; graded 🔴 rapid / 🟡 slow by the size of the decline.
- Industries whose peak employment is below a threshold (default 3000) are **excluded** to avoid small-base noise (transparently recorded in `excluded`).
- **HSIC industry classifications are aligned across versions** (`scripts/lib/hsic.mjs`) — the single biggest data-accuracy risk; without alignment, industries appear to "vanish/appear" out of nowhere.

## Structure

```
scripts/        pure Node data pipeline (ESM)
  config.mjs      data source URLs / thresholds
  fetch.mjs       download CSV → data/raw/ (--fixture uses local samples)
  build.mjs       align + compute CAGR + grade → industry_trends.json
  lib/            csv / cagr / hsic
data/           raw CSV + generated JSON (Git as the database, no DB server)
web/            Vite + React + TS + ECharts frontend
.github/        workflow that refreshes data monthly
```

## Develop

```bash
npm install              # root: data-pipeline deps
npm run gen:fixture      # generate offline sample data
npm run data             # fetch:fixture + build → industry_trends.json
npm run test:cagr        # CAGR / grading unit tests

cd web && npm install
npm run dev              # local frontend preview
```

The frontend `fetch('/industry_trends.json')` at runtime, so refreshing data needs **no frontend code change**.

## Data source

Real data comes from **C&SD table 215-16008** (number of establishments and persons engaged by industry; JSON API, full series from 2000):

```
https://www.censtatd.gov.hk/api/get.php?id=215-16008&lang=en&full_series=1
```

- `scripts/lib/censtatd.mjs` parses it: territory-wide totals (DC=''), annual (freq='Y'), leaf-level industries (`ind_NN`, dropping double-counting section aggregates like `ind_B` / `ind_G`).
- `sv`: `PE` = persons engaged, `EST` = establishments; an empty `figure` means suppressed (treated as missing).
- Offline / CI can still use the synthetic CSV from `npm run gen:fixture` (`scripts/fetch.mjs --fixture`).

The raw 28 MB API response is not committed (`data/raw/` is gitignored); only the processed `industry_trends.json` is.

## Deploy (Cloudflare Pages, auto via GitHub Actions)

`.github/workflows/deploy.yml` builds and deploys to Cloudflare Pages on every push to `main`. Add two repo Secrets under **Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN` — created in Cloudflare with *Account → Cloudflare Pages → Edit* permission
- `CLOUDFLARE_ACCOUNT_ID` — Account ID from the Cloudflare dashboard

Deploy uses `wrangler pages deploy web/dist --project-name=hk-vanishing-trades`. If the project doesn't exist on first run, create a same-named Pages project in the Cloudflare dashboard (or let wrangler create it).

> Alternatively use the Cloudflare dashboard's Git integration (build command `npm run build`, output `web/dist`) — either approach works.

## Data updates

C&SD data updates quarterly–annually and the conclusions change very slowly, so **no real-time fetching is needed**. `.github/workflows/update-data.yml` runs fetch+build on the 1st of each month and **commits only when the data changed**.
