import { useState } from 'react';
import { useTrends } from './useTrends';
import BubbleRace from './components/BubbleRace';
import DeclineRanking from './components/DeclineRanking';
import IndustryDetail from './components/IndustryDetail';

export default function App() {
  const state = useTrends();
  const [selected, setSelected] = useState<string | null>(null);

  if (state.status === 'loading') return <div className="status">载入数据中…</div>;
  if (state.status === 'error')
    return <div className="status">数据载入失败：{state.error}</div>;

  const { data } = state;
  const [from, to] = data.yearRange;
  const shrinkCount = data.industries.filter((i) => i.trend.startsWith('shrinking')).length;
  const selectedIndustry =
    data.industries.find((i) => i.code === (selected ?? data.ranking.shrinking[0])) ?? null;

  return (
    <main>
      <header className="hero">
        <h1>哪些行业在香港正在消失？</h1>
        <p className="lede">
          根据香港统计处公开数据，{from}–{to} 年间共 <b>{shrinkCount}</b> 个行业的
          就业人数与机构数同步萎缩。下面的气泡随时间涨缩，看着它们一个个缩小。
        </p>
        <p className="muted">
          数据来源：{data.source} · 更新于 {data.generatedAt}
        </p>
      </header>

      <section className="card">
        <BubbleRace industries={data.industries} />
      </section>

      <section className="card">
        <DeclineRanking
          industries={data.industries}
          codes={data.ranking.shrinking}
          onSelect={setSelected}
        />
        <p className="hint">点击上方任一行业，查看它的 20 年走势 ↓</p>
      </section>

      {selectedIndustry && (
        <section className="card">
          <IndustryDetail industry={selectedIndustry} />
        </section>
      )}

      {data.ranking.growing.length > 0 && (
        <section className="card">
          <DeclineRanking
            industries={data.industries}
            codes={data.ranking.growing}
            onSelect={setSelected}
          />
          <p className="hint">这些行业在崛起 —— 旧的消失，新的冒起。</p>
        </section>
      )}

      <footer className="footer">
        <p className="muted">
          方法：对每个行业的就业人数与机构数计算 {from}–{to} 年复合年增长率（CAGR），
          双指标同步下降才计为「萎缩」；就业人数峰值低于 {data.thresholds.MIN_ABS_PERSONS.toLocaleString()} 人的行业不入榜
          （已排除 {data.excluded.length} 个）。HSIC 行业分类已做跨版本对齐。
        </p>
      </footer>
    </main>
  );
}
