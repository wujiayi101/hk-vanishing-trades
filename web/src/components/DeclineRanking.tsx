import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { Industry } from '../types';
import { TREND_COLORS } from '../types';

// Horizontal bar chart of the fastest-shrinking industries by persons CAGR.
// Clicking a bar selects that industry (drives the detail chart).
export default function DeclineRanking({
  industries,
  codes,
  onSelect,
}: {
  industries: Industry[];
  codes: string[];
  onSelect: (code: string) => void;
}) {
  const rows = useMemo(
    () =>
      codes
        .map((c) => industries.find((i) => i.code === c))
        .filter((i): i is Industry => Boolean(i))
        .sort((a, b) => b.personsCAGR - a.personsCAGR), // least negative on top
    [industries, codes],
  );

  const option = useMemo<EChartsOption>(
    () => ({
      title: { text: '萎缩最快的行业 (就业人数年均变化)', left: 'center', textStyle: { fontSize: 16 } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 200, right: 60, top: 60, bottom: 30 },
      xAxis: {
        type: 'value',
        axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
      },
      yAxis: { type: 'category', data: rows.map((i) => i.name) },
      series: [
        {
          type: 'bar',
          data: rows.map((i) => ({
            value: i.personsCAGR,
            itemStyle: { color: TREND_COLORS[i.trend] },
          })),
          label: {
            show: true,
            position: 'right',
            formatter: (p: any) => `${(p.value * 100).toFixed(1)}%`,
          },
        },
      ],
    }),
    [rows],
  );

  return (
    <ReactECharts
      option={option}
      style={{ height: Math.max(240, rows.length * 38 + 100) }}
      onEvents={{
        click: (p: any) => {
          const row = rows[p.dataIndex];
          if (row) onSelect(row.code);
        },
      }}
    />
  );
}
