import { useEffect, useState } from 'react';
import type { TrendsData } from './types';

type State =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: TrendsData };

// Loads the generated dataset at runtime (kept out of the JS bundle so data
// updates don't require a code change). Served from web/public/.
export function useTrends(): State {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}industry_trends.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: TrendsData) => {
        if (!cancelled) setState({ status: 'ready', data });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: 'error', error: String(err) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
