import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cagr, classify } from './cagr.mjs';

test('cagr: halving over 1 year is -50%', () => {
  assert.ok(Math.abs(cagr(100, 50, 1) - -0.5) < 1e-9);
});

test('cagr: doubling over 10 years ~ 7.18%', () => {
  assert.ok(Math.abs(cagr(100, 200, 10) - 0.0717734625) < 1e-6);
});

test('cagr: no growth is 0', () => {
  assert.equal(cagr(100, 100, 5), 0);
});

test('cagr: returns null on non-positive endpoints or zero span', () => {
  assert.equal(cagr(0, 100, 5), null);
  assert.equal(cagr(100, 0, 5), null);
  assert.equal(cagr(100, 50, 0), null);
});

const T = { DECLINE_CAGR: -0.05, GROWTH_CAGR: 0.03 };

test('classify: both decline, steep => shrinking_fast', () => {
  assert.equal(classify(-0.08, -0.06, T), 'shrinking_fast');
});

test('classify: both decline, mild => shrinking_slow', () => {
  assert.equal(classify(-0.02, -0.01, T), 'shrinking_slow');
});

test('classify: persons growing fast => growing', () => {
  assert.equal(classify(0.06, 0.04, T), 'growing');
});

test('classify: persons up but establishments down => not shrinking', () => {
  assert.equal(classify(0.01, -0.02, T), 'stable');
});
