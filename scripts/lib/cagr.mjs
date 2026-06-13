// Compound annual growth rate and trend classification.

// CAGR over `years` periods. Returns null when it cannot be computed
// (non-positive endpoints or zero span), so callers can skip such series.
export function cagr(startVal, endVal, years) {
  if (years <= 0) return null;
  if (!(startVal > 0) || !(endVal > 0)) return null;
  return Math.pow(endVal / startVal, 1 / years) - 1;
}

// Classify an industry from its persons & establishments CAGRs.
// Returns one of: 'shrinking_fast' | 'shrinking_slow' | 'growing' | 'stable'.
// Note: 'transforming' (persons down but output up) needs GDP data — Phase 2.
export function classify(personsCAGR, establishmentsCAGR, t) {
  const bothDecline = personsCAGR < 0 && establishmentsCAGR < 0;
  if (bothDecline && personsCAGR < t.DECLINE_CAGR) return 'shrinking_fast';
  if (bothDecline) return 'shrinking_slow';
  if (personsCAGR > t.GROWTH_CAGR) return 'growing';
  return 'stable';
}

export const SHRINKING_TRENDS = new Set(['shrinking_fast', 'shrinking_slow']);
