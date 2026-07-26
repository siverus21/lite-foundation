import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Tooltip } from '../js/modules/tooltip.js';

describe('Tooltip', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <span class="has-tip" data-tip="Hello tip">hover me</span>
      <span class="has-tip" data-tip="Ignored" aria-label="Existing">kept</span>
      <span class="has-tip" data-tip="Via describedby" aria-describedby="desc">d</span>
      <span id="desc">Described</span>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('adds tabindex and aria-label when missing', () => {
    new Tooltip(document).destroy();
    const el = document.querySelector('.has-tip');
    expect(el.getAttribute('tabindex')).toBe('0');
    expect(el.getAttribute('aria-label')).toBe('Hello tip');
  });

  it('does not overwrite existing aria-label or aria-describedby', () => {
    new Tooltip(document).destroy();
    expect(document.querySelector('[aria-label="Existing"]').getAttribute('aria-label')).toBe(
      'Existing',
    );
    expect(document.querySelector('[aria-describedby]').hasAttribute('aria-label')).toBe(false);
  });
});
