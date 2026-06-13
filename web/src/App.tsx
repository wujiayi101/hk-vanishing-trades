import { useEffect, useState } from 'react';
import { useTrends } from './useTrends';
import BubbleRace from './components/BubbleRace';
import DeclineRanking from './components/DeclineRanking';
import IndustryDetail from './components/IndustryDetail';
import { LANGS, STR, type Lang } from './i18n';

export default function App() {
  const state = useTrends();
  const [lang, setLang] = useState<Lang>('zh');
  const [selected, setSelected] = useState<string | null>(null);

  const t = STR[lang];
  useEffect(() => {
    document.title = t.htmlTitle;
    document.documentElement.lang = lang === 'zh' ? 'zh-HK' : 'en';
  }, [lang, t.htmlTitle]);

  const toggle = (
    <div className="lang-toggle" role="group" aria-label="language">
      {LANGS.map((l) => (
        <button
          key={l.key}
          className={l.key === lang ? 'active' : ''}
          onClick={() => setLang(l.key)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );

  if (state.status === 'loading')
    return (
      <main>
        {toggle}
        <div className="status">{t.loading}</div>
      </main>
    );
  if (state.status === 'error')
    return (
      <main>
        {toggle}
        <div className="status">{t.error(state.error)}</div>
      </main>
    );

  const { data } = state;
  const [from, to] = data.yearRange;
  const shrinkCount = data.industries.filter((i) => i.trend.startsWith('shrinking')).length;
  const selectedIndustry =
    data.industries.find((i) => i.code === (selected ?? data.ranking.shrinking[0])) ?? null;
  const source = lang === 'zh' ? data.sourceZh : data.source;

  return (
    <main>
      {toggle}

      <header className="hero">
        <h1>{t.heroTitle}</h1>
        <p className="lede">{t.lede(shrinkCount, from, to)}</p>
        <p className="muted">{t.sourceLine(source, data.generatedAt)}</p>
      </header>

      <section className="card">
        <BubbleRace industries={data.industries} lang={lang} />
      </section>

      <section className="card">
        <DeclineRanking
          industries={data.industries}
          codes={data.ranking.shrinking}
          title={t.shrinkTitle}
          lang={lang}
          onSelect={setSelected}
        />
        <p className="hint">{t.hintDetail}</p>
      </section>

      {selectedIndustry && (
        <section className="card">
          <IndustryDetail industry={selectedIndustry} lang={lang} />
        </section>
      )}

      {data.ranking.growing.length > 0 && (
        <section className="card">
          <DeclineRanking
            industries={data.industries}
            codes={data.ranking.growing}
            title={t.growTitle}
            lang={lang}
            onSelect={setSelected}
          />
          <p className="hint">{t.hintGrowing}</p>
        </section>
      )}

      <footer className="footer">
        <p className="muted">{t.footer(from, to, data.thresholds.MIN_ABS_PERSONS, data.excluded.length)}</p>
      </footer>
    </main>
  );
}
