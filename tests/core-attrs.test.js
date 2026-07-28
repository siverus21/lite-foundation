import { describe, it, expect } from 'vitest';
import {
  toNumber,
  str,
  num,
  int,
  bool,
  list,
  json,
  clamp,
  snap,
  setAttrs,
} from '../js/core/attrs.js';

describe('attrs helpers', () => {
  it('toNumber treats null / undefined / empty as absent, not as 0', () => {
    expect(toNumber(null, 7)).toBe(7);
    expect(toNumber(undefined, 7)).toBe(7);
    expect(toNumber('', 7)).toBe(7);
    expect(toNumber('0', 7)).toBe(0);
    expect(toNumber('nope', 7)).toBe(7);
  });

  it('num / int / str read attributes with the same absent semantics', () => {
    const el = document.createElement('div');
    el.setAttribute('data-max', '12.7');
    el.setAttribute('data-label', 'hi');

    expect(num(el, 'data-max', 0)).toBe(12.7);
    expect(int(el, 'data-max', 0)).toBe(12);
    expect(num(el, 'data-missing', 3)).toBe(3);
    expect(str(el, 'data-label')).toBe('hi');
    expect(str(el, 'data-missing', 'x')).toBe('x');
  });

  it('bool is presence-or-value, with explicit false/0/off opt-out', () => {
    const el = document.createElement('div');
    expect(bool(el, 'data-wrap')).toBe(false);

    el.setAttribute('data-wrap', '');
    expect(bool(el, 'data-wrap')).toBe(true);

    el.setAttribute('data-wrap', 'true');
    expect(bool(el, 'data-wrap')).toBe(true);

    el.setAttribute('data-wrap', 'false');
    expect(bool(el, 'data-wrap')).toBe(false);

    el.setAttribute('data-wrap', '0');
    expect(bool(el, 'data-wrap')).toBe(false);
  });

  it('list splits and trims; json fails soft', () => {
    const el = document.createElement('div');
    el.setAttribute('data-tags', ' a, b , ,c ');
    el.setAttribute('data-bad', '{not json');
    el.setAttribute('data-ok', '{"a":1}');

    expect(list(el, 'data-tags')).toEqual(['a', 'b', 'c']);
    expect(json(el, 'data-bad', { fallback: true })).toEqual({ fallback: true });
    expect(json(el, 'data-ok', null)).toEqual({ a: 1 });
    expect(json(el, 'data-missing', [])).toEqual([]);
  });

  it('clamp and snap keep float steps on a clean grid', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(snap(0.2 + 0.1, 0.1)).toBe(0.3);
    expect(snap(1.24, 0.25)).toBe(1.25);
  });

  it('setAttrs writes, blanks and removes', () => {
    const el = document.createElement('div');
    setAttrs(el, { 'aria-busy': true, 'data-x': 2, 'data-y': null, hidden: false });
    expect(el.hasAttribute('aria-busy')).toBe(true);
    expect(el.getAttribute('data-x')).toBe('2');
    expect(el.hasAttribute('data-y')).toBe(false);
    expect(el.hasAttribute('hidden')).toBe(false);
  });
});
