// Read the latest raw CSV, align HSIC codes, aggregate per-industry time series,
// compute CAGR, classify trend, and write industry_trends.json.
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { readCsv } from './lib/csv.mjs';
import { parseCenstatd } from './lib/censtatd.mjs';
import { align } from './lib/hsic.mjs';
import { cagr, classify, SHRINKING_TRENDS } from './lib/cagr.mjs';
import { SOURCES, COLUMNS, THRESHOLDS, PATHS } from './config.mjs';

function latestRaw(id) {
  const files = readdirSync(PATHS.rawDir)
    .filter((f) => f.startsWith(`${id}-`) && (f.endsWith('.csv') || f.endsWith('.json')))
    .sort();
  if (files.length === 0) {
    throw new Error(`No raw data for "${id}" in ${PATHS.rawDir}. Run: npm run fetch (or fetch:fixture).`);
  }
  return join(PATHS.rawDir, files[files.length - 1]);
}

// Load a raw file into normalized rows: { year, code, name, persons, establishments }.
function loadRows(file) {
  if (file.endsWith('.json')) return parseCenstatd(file);
  return readCsv(file).map((row) => ({
    year: Number(row[COLUMNS.year]),
    code: row[COLUMNS.code],
    name: row[COLUMNS.name],
    persons: Number(row[COLUMNS.persons]),
    establishments: Number(row[COLUMNS.establishments]),
  }));
}

const src = SOURCES[0];
const rows = loadRows(latestRaw(src.id));

// Aggregate into per-canonical-code series.
const byCode = new Map();
const unaligned = new Map();
for (const rec of rows) {
  const a = align(rec);
  if (!a.aligned) {
    unaligned.set(a.code, (unaligned.get(a.code) || 0) + 1);
    continue;
  }
  if (!byCode.has(a.code)) {
    byCode.set(a.code, { code: a.code, name: a.name, persons: new Map(), establishments: new Map() });
  }
  const entry = byCode.get(a.code);
  // Only record present values; suppressed cells (null) leave a gap in the series.
  if (Number.isFinite(rec.persons)) {
    entry.persons.set(rec.year, (entry.persons.get(rec.year) || 0) + rec.persons);
  }
  if (Number.isFinite(rec.establishments)) {
    entry.establishments.set(rec.year, (entry.establishments.get(rec.year) || 0) + rec.establishments);
  }
}

const toSeries = (m) =>
  [...m.entries()].sort((a, b) => a[0] - b[0]).map(([year, value]) => ({ year, value }));

const industries = [];
const excluded = [];
let minYear = Infinity;
let maxYear = -Infinity;

for (const entry of byCode.values()) {
  const personsSeries = toSeries(entry.persons);
  const establishmentsSeries = toSeries(entry.establishments);
  if (personsSeries.length < 2) {
    excluded.push({ code: entry.code, name: entry.name, reason: 'insufficient_years' });
    continue;
  }

  const peakPersons = Math.max(...personsSeries.map((d) => d.value));
  if (peakPersons < THRESHOLDS.MIN_ABS_PERSONS) {
    excluded.push({ code: entry.code, name: entry.name, reason: 'below_min_persons', peakPersons });
    continue;
  }

  const pStart = personsSeries[0];
  const pEnd = personsSeries[personsSeries.length - 1];
  const eStart = establishmentsSeries[0];
  const eEnd = establishmentsSeries[establishmentsSeries.length - 1];
  const span = pEnd.year - pStart.year;

  const personsCAGR = cagr(pStart.value, pEnd.value, span);
  const establishmentsCAGR = cagr(eStart.value, eEnd.value, span);
  if (personsCAGR === null || establishmentsCAGR === null) {
    excluded.push({ code: entry.code, name: entry.name, reason: 'cagr_undefined' });
    continue;
  }

  minYear = Math.min(minYear, pStart.year);
  maxYear = Math.max(maxYear, pEnd.year);

  industries.push({
    code: entry.code,
    name: entry.name,
    personsSeries,
    establishmentsSeries,
    personsCAGR: Number(personsCAGR.toFixed(4)),
    establishmentsCAGR: Number(establishmentsCAGR.toFixed(4)),
    trend: classify(personsCAGR, establishmentsCAGR, THRESHOLDS),
  });
}

const shrinking = industries
  .filter((i) => SHRINKING_TRENDS.has(i.trend))
  .sort((a, b) => a.personsCAGR - b.personsCAGR)
  .slice(0, THRESHOLDS.TOP_N)
  .map((i) => i.code);

const growing = industries
  .filter((i) => i.trend === 'growing')
  .sort((a, b) => b.personsCAGR - a.personsCAGR)
  .slice(0, THRESHOLDS.TOP_N)
  .map((i) => i.code);

const out = {
  generatedAt: (process.env.FETCH_DATE || new Date().toISOString().slice(0, 10)),
  source: src.label,
  yearRange: [minYear, maxYear],
  thresholds: THRESHOLDS,
  industries,
  ranking: { shrinking, growing },
  excluded,
  unaligned: [...unaligned.entries()].map(([code, count]) => ({ code, count })),
};

const json = JSON.stringify(out, null, 2);
for (const target of [PATHS.outCanonical, PATHS.outWeb]) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, json, 'utf8');
  console.log(`Wrote ${target}`);
}

console.log(
  `Industries: ${industries.length} | shrinking: ${shrinking.length} | growing: ${growing.length} | excluded: ${excluded.length} | unaligned codes: ${unaligned.size}`,
);
