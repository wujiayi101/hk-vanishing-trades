// Download the source CSV(s) into data/raw/<id>-<YYYYMMDD>.csv.
// With --fixture, copy the local sample instead (offline development).
import { mkdirSync, copyFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SOURCES, PATHS } from './config.mjs';

const useFixture = process.argv.includes('--fixture');
const stamp = (process.env.FETCH_DATE || new Date().toISOString().slice(0, 10)).replaceAll('-', '');

mkdirSync(PATHS.rawDir, { recursive: true });

async function downloadOne(src) {
  if (useFixture) {
    const dest = join(PATHS.rawDir, `${src.id}-${stamp}.csv`);
    if (!existsSync(PATHS.fixture)) {
      throw new Error(`Fixture not found at ${PATHS.fixture}. Run: npm run gen:fixture`);
    }
    copyFileSync(PATHS.fixture, dest);
    console.log(`[fixture] ${PATHS.fixture} -> ${dest}`);
    return;
  }

  if (!src.url) {
    throw new Error(
      `No URL configured for "${src.id}". Fill SOURCES[].url in scripts/config.mjs, ` +
        `or run with --fixture for offline development.`,
    );
  }

  const isJson = src.format === 'censtatd-json';

  async function grab(url, suffix) {
    const dest = join(PATHS.rawDir, `${src.id}-${stamp}${suffix}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText} for ${url}`);
    const text = await res.text();
    if (isJson) {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error(`Downloaded content for ${src.id} is not valid JSON`);
      }
      if (!Array.isArray(parsed.dataSet) || parsed.dataSet.length === 0) {
        throw new Error(`C&SD response for ${src.id} has no dataSet records`);
      }
    } else if (!text.trim() || !text.includes(',')) {
      throw new Error(`Downloaded content for ${src.id} does not look like CSV`);
    }
    writeFileSync(dest, text, 'utf8');
    console.log(`[download] ${url} -> ${dest} (${text.length} bytes)`);
  }

  if (isJson) {
    await grab(src.url, '.en.json');
    if (src.urlZh) await grab(src.urlZh, '.zh.json');
  } else {
    await grab(src.url, '.csv');
  }
}

for (const src of SOURCES) {
  await downloadOne(src);
}
