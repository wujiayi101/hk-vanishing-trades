import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { Industry } from '../types';
import { TREND_LABELS } from '../types';

// Dual-line detail for one industry: persons engaged + number of establishments
// over the full period.
export default function IndustryDetail({ industry }: { industry: Industry }) {
  const option = useMemo<EChartsOption>(
    () => ({
      title: {
        text: industry.name,
        subtext: `${TREND_LABELS[industry.trend]} · 就业 CAGR ${(industry.personsCAGR * 100).toFixed(1)}% · 机构 CAGR ${(industry.establishmentsCAGR * 100).toFixed(1)}%`,
        left: 'center',
        textStyle: { fontSize: 16 },
      },
      tooltip: { trigger: 'axis' },
      legend: { data: ['就业人数', '机构数'], bottom: 0 },
      grid: { left: 70, right: 70, top: 80, bottom: 50 },
      xAxis: { type: 'category', data: industry.personsSeries.map((p) => p.year) },
      yAxis: [
        { type: 'value', name: '就业人数', position: 'left' },
        { type: 'value', name: '机构数', position: 'right' },
      ],
      series: [
        {
          name: '就业人数',
          type: 'line',
          smooth: true,
          data: industry.personsSeries.map((p) => p.value),
          itemStyle: { color: '#e4572e' },
        },
        {
          name: '机构数',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: industry.establishmentsSeries.map((p) => p.value),
          itemStyle: { color: '#4361ee' },
        },
      ],
    }),
    [industry],
  );

  return <ReactECharts option={option} style={{ height: 380 }} notMerge />;
}
