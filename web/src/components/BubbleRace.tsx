import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { Industry } from '../types';
import { TREND_COLORS } from '../types';
import { STR, industryName, shortLabel, type Lang } from '../i18n';

// Animated bubble "race": each year shows every industry as a bubble
// (x = establishments, y = persons engaged, size = persons, color = trend).
// The timeline plays across years so you watch industries swell and shrink.
export default function BubbleRace({ industries, lang }: { industries: Industry[]; lang: Lang }) {
  const t = STR[lang];

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
            name: industryName(i, lang),
            value: [valueAt(i, year, 'establishmentsSeries'), valueAt(i, year, 'personsSeries')],
            itemStyle: { color: TREND_COLORS[i.trend], opacity: 0.8 },
            label: { show: true, formatter: shortLabel(i, lang) },
          })),
          symbolSize: (val: number[]) => 8 + 60 * Math.sqrt(val[1] / maxPersons),
          label: { show: true, position: 'top', fontSize: 10, color: '#555' },
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
        title: { text: t.bubbleTitle, left: 'center', textStyle: { fontSize: 16 } },
        tooltip: {
          formatter: (p: any) =>
            `${p.name}<br/>${t.tipPersons}：${p.value[1].toLocaleString()}<br/>${t.tipEst}：${p.value[0].toLocaleString()}`,
        },
        grid: { left: 16, right: 40, top: 60, bottom: 60, containLabel: true },
        xAxis: { type: 'value', name: t.bubbleX, scale: true },
        yAxis: { type: 'value', name: t.bubbleY, scale: true },
      },
      options,
    } as unknown as EChartsOption;
  }, [industries, lang, t]);

  return <ReactECharts option={option} style={{ height: 520 }} notMerge />;
}
