import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { Industry } from '../types';
import { TREND_COLORS } from '../types';

// Animated bubble "race": each year shows every industry as a bubble
// (x = establishments, y = persons engaged, size = persons, color = trend).
// The timeline plays across years so you watch industries swell and shrink.
export default function BubbleRace({ industries }: { industries: Industry[] }) {
  const option = useMemo<EChartsOption>(() => {
    const years = [
      ...new Set(industries.flatMap((i) => i.personsSeries.map((p) => p.year))),
    ].sort((a, b) => a - b);
    const valueAt = (i: Industry, year: number, key: 'personsSeries' | 'establishmentsSeries') =>
      i[key].find((p) => p.year === year)?.value ?? 0;

    const maxPersons = Math.max(...industries.flatMap((i) => i.personsSeries.map((p) => p.value)), 1);

    const options = years.map((year) => ({
      series: [
        {
          type: 'scatter',
          data: industries.map((i) => ({
            name: i.name,
            value: [valueAt(i, year, 'establishmentsSeries'), valueAt(i, year, 'personsSeries')],
            itemStyle: { color: TREND_COLORS[i.trend], opacity: 0.8 },
          })),
          symbolSize: (val: number[]) => 8 + 60 * Math.sqrt(val[1] / maxPersons),
          label: {
            show: true,
            formatter: (p: any) => String(p.name).split(' ')[0],
            position: 'top',
            fontSize: 10,
            color: '#555',
          },
        },
      ],
    }));

    return {
      baseOption: {
        timeline: {
          axisType: 'category',
          autoPlay: true,
          playInterval: 900,
          data: years,
          label: { formatter: (s: any) => `${s}` },
          controlStyle: { showPlayBtn: true },
        },
        title: { text: '香港各行业兴衰 (就业人数 × 机构数)', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: {
          formatter: (p: any) =>
            `${p.name}<br/>就业人数：${p.value[1].toLocaleString()}<br/>机构数：${p.value[0].toLocaleString()}`,
        },
        grid: { left: 70, right: 40, top: 60, bottom: 60 },
        xAxis: { type: 'value', name: '机构数', scale: true },
        yAxis: { type: 'value', name: '就业人数', scale: true },
      },
      options,
    } as unknown as EChartsOption;
  }, [industries]);

  return <ReactECharts option={option} style={{ height: 520 }} notMerge />;
}
