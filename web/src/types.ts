export type Trend = 'shrinking_fast' | 'shrinking_slow' | 'growing' | 'stable';

export interface Point {
  year: number;
  value: number;
}

export interface Industry {
  code: string;
  name: string;
  personsSeries: Point[];
  establishmentsSeries: Point[];
  personsCAGR: number;
  establishmentsCAGR: number;
  trend: Trend;
}

export interface Excluded {
  code: string;
  name: string;
  reason: string;
  peakPersons?: number;
}

export interface TrendsData {
  generatedAt: string;
  source: string;
  yearRange: [number, number];
  thresholds: {
    MIN_ABS_PERSONS: number;
    DECLINE_CAGR: number;
    GROWTH_CAGR: number;
    TOP_N: number;
  };
  industries: Industry[];
  ranking: { shrinking: string[]; growing: string[] };
  excluded: Excluded[];
  unaligned: { code: string; count: number }[];
}

export const TREND_COLORS: Record<Trend, string> = {
  shrinking_fast: '#e4572e',
  shrinking_slow: '#f3a712',
  growing: '#2a9d8f',
  stable: '#8d99ae',
};

export const TREND_LABELS: Record<Trend, string> = {
  shrinking_fast: '急速萎缩',
  shrinking_slow: '缓慢萎缩',
  growing: '正在增长',
  stable: '大致平稳',
};
