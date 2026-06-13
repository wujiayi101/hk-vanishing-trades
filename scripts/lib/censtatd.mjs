import { readFileSync } from 'node:fs';

// Parse the C&SD JSON API (table 215-16008) into normalized rows:
//   { year, code, name, persons, establishments }
//
// Notes on the source shape:
//  - Each record is one (industry, district, year, statistic) cell.
//  - DC === '' is the Hong Kong-wide total (district breakdown otherwise).
//  - sv 'PE' = persons engaged, 'EST' = number of establishments.
//  - IND 'ind_NN' are leaf HSIC divisions; 'ind_B', 'ind_G45_46', ... are
//    section/grouping aggregates that would double-count — we drop them.
//  - figure '' means the value was suppressed; treat as missing (null).
export function parseCenstatd(filePath) {
  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  const recs = raw.dataSet || [];

  const byKey = new Map(); // `${code}|${year}` -> normalized row
  const names = new Map(); // code -> cleaned name

  for (const r of recs) {
    if (r.DC !== '') continue; // HK-wide total only
    if (r.freq !== 'Y') continue; // annual series
    if (!/^ind_\d+$/.test(r.IND)) continue; // leaf divisions only

    const year = Number(r.period);
    if (!Number.isFinite(year)) continue;

    const name = String(r.INDDesc || '').replace(/^\d+\s+/, '').trim();
    names.set(r.IND, name);

    const key = `${r.IND}|${year}`;
    if (!byKey.has(key)) {
      byKey.set(key, { year, code: r.IND, name, persons: null, establishments: null });
    }
    const row = byKey.get(key);
    const value = r.figure === '' || r.figure == null ? null : Number(r.figure);
    if (value == null || Number.isNaN(value)) continue;
    if (r.sv === 'PE') row.persons = value;
    else if (r.sv === 'EST') row.establishments = value;
  }

  return [...byKey.values()].map((row) => ({ ...row, name: names.get(row.code) }));
}
