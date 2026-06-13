// Central config for the data pipeline.
//
// NOTE: the real C&SD dataset URL still needs to be confirmed from
// data.gov.hk / censtatd.gov.hk and filled into SOURCES[].url. The target is the
// time series of "number of establishments & persons engaged by industry (HSIC)".
// Until then, develop with the fixture: `npm run fetch:fixture`.

export const SOURCES = [
  {
    id: 'persons-establishments-by-industry',
    // C&SD Table 215-16008: Number of establishments and persons engaged
    // (other than the Civil Service) by industry division & District Council.
    // JSON API, full back-cast series 2000-present. We use HK-wide totals (DC='').
    url: 'https://www.censtatd.gov.hk/api/get.php?id=215-16008&lang=en&full_series=1',
    urlZh: 'https://www.censtatd.gov.hk/api/get.php?id=215-16008&lang=sc&full_series=1',
    label: 'C&SD Table 215-16008: Establishments & persons engaged by industry',
    labelZh: '统计处表 215-16008：按行业划分的机构单位数目及就业人数',
    format: 'censtatd-json',
  },
];

// Columns for the CSV fixture path (offline development).
export const COLUMNS = {
  year: 'year',
  code: 'code',
  name: 'name',
  persons: 'persons',
  establishments: 'establishments',
};

export const THRESHOLDS = {
  // Industries with fewer than this many persons engaged (at their peak) are
  // excluded from the ranking to avoid tiny-base noise (e.g. "dropped 50%" on 200 people).
  MIN_ABS_PERSONS: 3000,
  // CAGR below this (and both persons + establishments declining) => "shrinking fast".
  DECLINE_CAGR: -0.05,
  // CAGR above this => counted in the "growing" comparison group.
  GROWTH_CAGR: 0.03,
  // How many industries to surface in each ranking list.
  TOP_N: 15,
};

export const PATHS = {
  rawDir: 'data/raw',
  fixture: 'data/fixtures/sample.csv',
  outCanonical: 'data/industry_trends.json',
  outWeb: 'web/public/industry_trends.json',
};
