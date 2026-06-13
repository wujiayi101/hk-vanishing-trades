// Generate a deterministic sample CSV so the whole pipeline + frontend can be
// developed before the real C&SD dataset URL is confirmed.
// Columns: year,code,name,persons,establishments
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { CANONICAL } from './lib/hsic.mjs';
import { PATHS } from './config.mjs';

const START_YEAR = 2003;
const END_YEAR = 2024;

// Per-industry synthetic trajectories: [persons@start, persons CAGR, est@start, est CAGR]
const SPEC = {
  C13: [158000, -0.085, 9000, -0.07], // textiles — collapsing (offshored)
  C26: [95000, -0.045, 4200, -0.05], // watch/electronics — shrinking
  C18: [42000, -0.035, 4800, -0.04], // printing — slow decline
  A03: [9500, -0.06, 3100, -0.05], // fishing — shrinking
  G47R: [5200, -0.11, 900, -0.13], // video rental — collapsing
  S95: [1500, -0.08, 1100, -0.07], // repair trades — shrinking but tiny (should be excluded by MIN)
  K64: [180000, 0.025, 14000, 0.02], // finance — growing
  J62: [60000, 0.05, 7000, 0.06], // IT — growing fast
  Q88: [90000, 0.045, 5500, 0.04], // elderly care — growing
  H49: [200000, 0.005, 20000, -0.005], // logistics — roughly flat
};

// Deterministic wobble (no RNG) so the series look real but reproduce exactly.
const wobble = (year, seed) => 1 + 0.02 * Math.sin(year * 1.7 + seed);

const rows = [['year', 'code', 'name', 'persons', 'establishments']];
let seed = 0;
for (const [code, [p0, pr, e0, er]] of Object.entries(SPEC)) {
  seed += 1;
  for (let y = START_YEAR; y <= END_YEAR; y++) {
    const n = y - START_YEAR;
    const persons = Math.round(p0 * Math.pow(1 + pr, n) * wobble(y, seed));
    const establishments = Math.round(e0 * Math.pow(1 + er, n) * wobble(y, seed + 100));
    rows.push([y, code, CANONICAL[code], persons, establishments]);
  }
}

const cell = (v) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};
const csv = rows.map((r) => r.map(cell).join(',')).join('\n') + '\n';
mkdirSync(dirname(PATHS.fixture), { recursive: true });
writeFileSync(PATHS.fixture, csv, 'utf8');
console.log(`Wrote ${PATHS.fixture} (${rows.length - 1} rows, ${Object.keys(SPEC).length} industries, ${START_YEAR}-${END_YEAR})`);
