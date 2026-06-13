import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { Industry } from '../types';
import { STR, industryName, trendLabel, type Lang } from '../i18n';

// Dual-line detail for one industry: persons engaged + number of establishments
// over the full period.
export default function IndustryDetail({ industry, lang }: { industry: Industry; lang: Lang }) {
  const t = STR[lang];

  const option = useMemo<EChartsOption>(
    () => ({
      title: {
        text: industryName(industry, lang),
        subtext: t.detailSubtext(
          trendLabel(industry.trend, lang),
          industry.personsCAGR,
          industry.establishmentsCAGR,
        ),
        left: 'center',
        textStyle: { fontSize: 16 },
      },
      tooltip: { trigger: 'axis' },
      legend: { data: [t.tipPersons, t.tipEst], bottom: 0 },
      grid: { left: 16, right: 16, top: 80, bottom: 50, containLabel: true },
      xAxis: { type: 'category', data: industry.personsSeries.map((p) => p.year) },
      yAxis: [
        { type: 'value', name: t.tipPersons, position: 'left' },
        { type: 'value', name: t.tipEst, position: 'right' },
      ],
      series: [
        {
          name: t.tipPersons,
          type: 'line',
          smooth: true,
          data: industry.personsSeries.map((p) => p.value),
          itemStyle: { color: '#e4572e' },
        },
        {
          name: t.tipEst,
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: industry.establishmentsSeries.map((p) => p.value),
          itemStyle: { color: '#4361ee' },
        },
      ],
    }),
    [industry, lang, t],
  );

  return <ReactECharts option={option} style={{ height: 380 }} notMerge />;
}
