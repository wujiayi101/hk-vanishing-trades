# hk-vanishing-trades

「哪些行业在香港正在消失？」—— 用香港统计处（C&SD，data.gov.hk）公开数据，量化哪些行业的就业人数与机构数正在同步萎缩，并用交互图表讲成一个数据故事。

## 它怎么判断「消失」

对每个行业，取 ~20 年的**就业人数**与**机构数**时间序列：

- 算各自的 **CAGR**（复合年增长率）。
- **双指标同步下降**才算「萎缩」；据降幅分为 🔴 急速 / 🟡 缓慢。
- 就业峰值低于阈值（默认 3000 人）的行业**不入榜**，避免小基数噪音（透明记录在 `excluded`）。
- **HSIC 行业分类跨版本对齐**（`scripts/lib/hsic.mjs`）—— 这是本项目最大的数据准确性风险点，不对齐会让行业「凭空消失/出现」。

## 结构

```
scripts/        纯 Node 数据管线 (ESM)
  config.mjs      数据源 URL / 阈值
  fetch.mjs       下载 CSV → data/raw/（--fixture 用本地样例）
  build.mjs       对齐 + 算 CAGR + 分级 → industry_trends.json
  lib/            csv / cagr / hsic
data/           原始 CSV + 生成的 JSON（用 Git 当数据库，无需数据库服务）
web/            Vite + React + TS + ECharts 前端
.github/        每月自动刷新数据的 workflow
```

## 本地开发

```bash
npm install              # 根：数据管线依赖
npm run gen:fixture      # 生成离线样例数据
npm run data             # fetch:fixture + build → industry_trends.json
npm run test:cagr        # CAGR / 分级 单元测试

cd web && npm install
npm run dev              # 本地预览前端
```

前端运行时 `fetch('/industry_trends.json')`，所以更新数据**无需改前端代码**。

## 数据源

真实数据来自 **C&SD 表 215-16008**（按行业划分的机构单位数目及就业人数，JSON API，2000 年至今全序列）：

```
https://www.censtatd.gov.hk/api/get.php?id=215-16008&lang=en&full_series=1
```

- `scripts/lib/censtatd.mjs` 解析：取全港总数（DC=''）、年度（freq='Y'）、叶级行业（`ind_NN`，剔除会重复计数的 section 聚合如 `ind_B`/`ind_G`）。
- `sv`：`PE`=就业人数、`EST`=机构数；`figure` 为空表示被抑制（当作缺失）。
- 离线/CI 仍可用 `npm run gen:fixture` 的合成 CSV（`scripts/fetch.mjs --fixture`）。

原始 28MB API 响应不入库（`data/raw/` 已 gitignore），只提交处理后的 `industry_trends.json`。

## 部署（Cloudflare Pages，GitHub Actions 自动部署）

`.github/workflows/deploy.yml` 在每次 push 到 `main` 时构建并部署到 Cloudflare Pages。
需要在 GitHub 仓库 **Settings → Secrets and variables → Actions** 添加两个 secret：

- `CLOUDFLARE_API_TOKEN` —— Cloudflare 创建，权限含 *Account → Cloudflare Pages → Edit*
- `CLOUDFLARE_ACCOUNT_ID` —— Cloudflare 控制台右侧 Account ID

部署用 `wrangler pages deploy web/dist --project-name=hk-vanishing-trades`。
首次若提示项目不存在，在 Cloudflare 控制台建一个同名 Pages 项目（或用 wrangler 首次创建）即可。

> 也可改用 Cloudflare 控制台的 Git 集成（Build command `npm run build`、输出 `web/dist`）；二选一即可。

## 数据更新

C&SD 数据季度~年度更新，结论变化极慢，因此**不需要实时抓取**。
`.github/workflows/update-data.yml` 每月 1 号自动 fetch+build，**数据有变化才提交**。
