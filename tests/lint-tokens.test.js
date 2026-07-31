import { describe, it, expect } from 'vitest';
import { lintSource } from '../scripts/lint-tokens.js';

describe('lintSource', () => {
  it('flags bare hex and numeric rgba', () => {
    const { hits } = lintSource(`
.button { color: #ff0000; }
.chip { background: rgba(0, 0, 0, 0.08); }
`);
    expect(hits.some((h) => h.value === '#ff0000')).toBe(true);
    expect(hits.some((h) => /rgba\(0/.test(h.value))).toBe(true);
  });

  it('flags Sass-variable rgba/hsla that previously bypassed the numeric RGB rule', () => {
    const { hits } = lintSource(`.chip-close:hover { background: rgba($black, 0.08); }`);
    expect(hits.some((h) => h.value.startsWith('rgba($black'))).toBe(true);
  });

  it('allows literals as var(--lf-…) fallbacks or --lf-* token definitions', () => {
    const { hits } = lintSource(`
.chip-close:hover {
  background: var(--lf-overlay-soft, #{rgba($black, 0.08)});
}
.button { color: var(--lf-color-primary, #1779ba); }
.checkbox-control {
  --lf-choice-focus-ring: #{rgba($color, 0.35)};
}
`);
    expect(hits).toEqual([]);
  });

  it('flags hardcoded z-index', () => {
    const { hits } = lintSource(`.modal { z-index: 1005; }`);
    expect(hits.some((h) => h.kind === 'z-index')).toBe(true);
  });
});
