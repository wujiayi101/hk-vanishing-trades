// HSIC (Hong Kong Standard Industrial Classification) alignment.
//
// THE BIGGEST DATA-ACCURACY RISK in this project: HSIC has been revised
// (e.g. v1.1 -> v2.0). If you compare raw industry codes across years without
// aligning them, industries appear to vanish or spring into existence purely
// because their code changed. This module maps source codes to one canonical
// set of categories, and flags anything it cannot align so it can be excluded
// (transparently) rather than silently mis-counted.

// Canonical categories used for the whole time series.
// code -> human label. Extend this as the real data is mapped.
export const CANONICAL = {
  C13: 'Textiles & clothing manufacturing',
  C26: 'Watch, clock & electronics manufacturing',
  C18: 'Printing & reproduction of media',
  A03: 'Fishing',
  G47R: 'Video / disc & physical-media rental',
  K64: 'Financial & insurance services',
  J62: 'Information technology & software',
  Q88: 'Social work & elderly care services',
  H49: 'Land transport & logistics',
  S95: 'Watch & footwear repair (traditional trades)',
};

// Map a raw source code to a canonical code.
// For the fixture the codes are already canonical, so this is mostly identity;
// for real C&SD data, add the version-specific remaps here.
const REMAP = {
  // example of a revision remap once real codes are known:
  // 'C13a': 'C13', 'C13b': 'C13',
};

// Align one normalized record. Returns { code, name, aligned }.
// The real C&SD table (215-16008) already publishes one consistent HSIC
// classification across its full back-cast series, so its divisions pass
// through as aligned. REMAP/CANONICAL remain the hook for any future source
// that mixes classification versions (and for the offline fixture codes).
export function align(record) {
  const raw = String(record.code || '').trim();
  const canonical = REMAP[raw] || raw;
  if (Object.prototype.hasOwnProperty.call(CANONICAL, canonical)) {
    return { code: canonical, name: CANONICAL[canonical], aligned: true };
  }
  if (canonical) {
    return { code: canonical, name: record.name || raw, aligned: true };
  }
  return { code: canonical, name: raw, aligned: false };
}
