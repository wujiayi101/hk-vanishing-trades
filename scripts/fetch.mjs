// Download the source CSV(s) into data/raw/<id>-<YYYYMMDD>.csv.
// With --fixture, copy the local sample instead (offline development).
import { mkdirSync, copyFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SOURCES, PATHS } from './config.mjs';

const useFixture = process.argv.includes('--fixture');
const stamp = (process.env.FETCH_DATE || new Date().toISOString().slice(0, 10)).replaceAll('-', '');

mkdirSync(PATHS.rawDir, { recursive: true });

async function downloadOne(src) {
  const dest = join(PATHS.rawDir, `${src.id}-${stamp}.csv`);

  if (useFixture) {
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

  const res = await fetch(src.url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText} for ${src.url}`);
  const text = await res.text();
  if (!text.trim() || !text.includes(',')) {
    throw new Error(`Downloaded content for ${src.id} does not look like CSV`);
  }
  writeFileSync(dest, text, 'utf8');
  console.log(`[download] ${src.url} -> ${dest} (${text.length} bytes)`);
}

for (const src of SOURCES) {
  await downloadOne(src);
}
