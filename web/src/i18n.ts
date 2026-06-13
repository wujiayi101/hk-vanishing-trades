import type { Industry, Trend } from './types';

export type Lang = 'zh' | 'en';

export const LANGS: { key: Lang; label: string }[] = [
  { key: 'zh', label: '中文' },
  { key: 'en', label: 'EN' },
];

type Strings = {
  htmlTitle: string;
  heroTitle: string;
  lede: (n: number, from: number, to: number) => string;
  sourceLine: (source: string, date: string) => string;
  bubbleTitle: string;
  bubbleX: string;
  bubbleY: string;
  tipPersons: string;
  tipEst: string;
  shrinkTitle: string;
  growTitle: string;
  hintDetail: string;
  hintGrowing: string;
  detailSubtext: (trend: string, pc: number, ec: number) => string;
  footer: (from: number, to: number, min: number, excluded: number) => string;
  loading: string;
  error: (msg: string) => string;
  trends: Record<Trend, string>;
};

export const STR: Record<Lang, Strings> = {
  zh: {
    htmlTitle: '哪些行业在香港正在消失？',
    heroTitle: '哪些行业在香港正在消失？',
    lede: (n, from, to) =>
      `根据香港统计处公开数据，${from}–${to} 年间共 ${n} 个行业的就业人数与机构数同步萎缩。下面的气泡随时间涨缩，看着它们一个个缩小。`,
    sourceLine: (source, date) => `数据来源：${source} · 更新于 ${date}`,
    bubbleTitle: '香港各行业兴衰（就业人数 × 机构数）',
    bubbleX: '机构数',
    bubbleY: '就业人数',
    tipPersons: '就业人数',
    tipEst: '机构数',
    shrinkTitle: '萎缩最快的行业（就业人数年均变化）',
    growTitle: '增长最快的行业（就业人数年均变化）',
    hintDetail: '点击上方任一行业，查看它的逐年走势 ↓',
    hintGrowing: '这些行业在崛起 —— 旧的消失，新的冒起。',
    detailSubtext: (trend, pc, ec) =>
      `${trend} · 就业 CAGR ${(pc * 100).toFixed(1)}% · 机构 CAGR ${(ec * 100).toFixed(1)}%`,
    footer: (from, to, min, excluded) =>
      `方法：对每个行业的就业人数与机构数计算 ${from}–${to} 年复合年增长率（CAGR），双指标同步下降才计为「萎缩」；就业人数峰值低于 ${min.toLocaleString()} 人的行业不入榜（已排除 ${excluded} 个）。`,
    loading: '载入数据中…',
    error: (msg) => `数据载入失败：${msg}`,
    trends: {
      shrinking_fast: '急速萎缩',
      shrinking_slow: '缓慢萎缩',
      growing: '正在增长',
      stable: '大致平稳',
    },
  },
  en: {
    htmlTitle: 'Which industries are disappearing in Hong Kong?',
    heroTitle: 'Which industries are disappearing in Hong Kong?',
    lede: (n, from, to) =>
      `Based on Hong Kong C&SD open data, ${n} industries saw both employment and the number of establishments shrink between ${from} and ${to}. Watch the bubbles swell and shrink over time.`,
    sourceLine: (source, date) => `Source: ${source} · updated ${date}`,
    bubbleTitle: 'Rise & fall of HK industries (persons engaged × establishments)',
    bubbleX: 'Establishments',
    bubbleY: 'Persons engaged',
    tipPersons: 'Persons engaged',
    tipEst: 'Establishments',
    shrinkTitle: 'Fastest-shrinking industries (avg. annual change in persons engaged)',
    growTitle: 'Fastest-growing industries (avg. annual change in persons engaged)',
    hintDetail: 'Click any industry above to see its year-by-year trend ↓',
    hintGrowing: 'These are rising — as the old fade, the new emerge.',
    detailSubtext: (trend, pc, ec) =>
      `${trend} · persons CAGR ${(pc * 100).toFixed(1)}% · establishments CAGR ${(ec * 100).toFixed(1)}%`,
    footer: (from, to, min, excluded) =>
      `Method: for each industry we compute the ${from}–${to} compound annual growth rate (CAGR) of both persons engaged and establishments; an industry counts as "shrinking" only when both decline. Industries whose peak employment is below ${min.toLocaleString()} are excluded (${excluded} dropped).`,
    loading: 'Loading…',
    error: (msg) => `Failed to load data: ${msg}`,
    trends: {
      shrinking_fast: 'Shrinking fast',
      shrinking_slow: 'Shrinking slowly',
      growing: 'Growing',
      stable: 'Stable',
    },
  },
};

export const industryName = (i: Industry, lang: Lang) => (lang === 'zh' ? i.nameZh : i.name);

// A short label for cramped bubble annotations.
export const shortLabel = (i: Industry, lang: Lang) =>
  lang === 'zh' ? i.nameZh.replace(/的(制造|服务)$/, '').slice(0, 6) : i.name.split(' ')[0];

export const trendLabel = (t: Trend, lang: Lang) => STR[lang].trends[t];
