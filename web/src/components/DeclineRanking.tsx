import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { Industry } from '../types';
import { TREND_COLORS } from '../types';
import { industryName, trendLabel, type Lang } from '../i18n';

// Horizontal bar chart of a ranking (shrinking or growing) by persons CAGR.
// Clicking a bar selects that industry (drives the detail chart).
export default function DeclineRanking({
  industries,
  codes,
  title,
  lang,
  onSelect,
}: {
  industries: Industry[];
  codes: string[];
  title: string;
  lang: Lang;
  onSelect: (code: string) => void;
}) {
  const rows = useMemo(
    () =>
      codes
        .map((c) => industries.find((i) => i.code === c))
        .filter((i): i is Industry => Boolean(i))
        // ECharts renders data[0] at the bottom, so sorting ascending by
        // magnitude puts the biggest change on top (steepest decline for the
        // shrinking chart, fastest growth for the growing chart) — top = high.
        .sort((a, b) => Math.abs(a.personsCAGR) - Math.abs(b.personsCAGR)),
    [industries, codes],
  );

  const option = useMemo<EChartsOption>(
    () => ({
      title: { text: title, left: 'center', textStyle: { fontSize: 16 } },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const i = rows[p.dataIndex];
          const sign = i.personsCAGR >= 0 ? '+' : '';
          return `${industryName(i, lang)}<br/>${trendLabel(i.trend, lang)} · ${sign}${(i.personsCAGR * 100).toFixed(1)}%`;
        },
      },
      // containLabel lets ECharts reserve exactly the room the wrapped labels
      // need, so long names are never cropped (the bug in the first version).
      grid: { left: 8, right: 64, top: 56, bottom: 24, containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
      },
      yAxis: {
        type: 'category',
        data: rows.map((i) => industryName(i, lang)),
        axisLabel: {
          interval: 0,
          width: lang === 'zh' ? 150 : 200,
          overflow: 'break',
          lineHeight: 15,
          fontSize: 12,
        },
      },
      series: [
        {
          type: 'bar',
          data: rows.map((i) => ({ value: i.personsCAGR, itemStyle: { color: TREND_COLORS[i.trend] } })),
          label: {
            show: true,
            position: 'right',
            formatter: (p: any) => `${p.value >= 0 ? '+' : ''}${(p.value * 100).toFixed(1)}%`,
          },
        },
      ],
    }),
    [rows, title, lang],
  );

  return (
    <ReactECharts
      option={option}
      notMerge
      style={{ height: Math.max(260, rows.length * 46 + 96) }}
      onEvents={{
        click: (p: any) => {
          const row = rows[p.dataIndex];
          if (row) onSelect(row.code);
        },
      }}
    />
  );
}
