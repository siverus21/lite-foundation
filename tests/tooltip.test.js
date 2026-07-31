import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Tooltip } from '../js/modules/tooltip.js';

describe('Tooltip', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <span class="has-tip" data-tip="Hello tip">hover me</span>
      <button type="button" class="has-tip" data-tip="On button">btn</button>
      <span class="has-tip" data-tip="Ignored" aria-label="Existing">kept</span>
      <span class="has-tip" data-tip="Via describedby" aria-describedby="desc">d</span>
      <span id="desc">Described</span>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('adds aria-label when missing and never injects tabindex', () => {
    new Tooltip(document).destroy();
    const el = document.querySelector('span.has-tip');
    expect(el.getAttribute('aria-label')).toBe('Hello tip');
    expect(el.hasAttribute('tabindex')).toBe(false);
  });

  it('preserves an author-provided tabindex on focusable hosts', () => {
    document.body.innerHTML = `<span class="has-tip" data-tip="x" tabindex="0">focusable</span>`;
    new Tooltip(document).destroy();
    expect(document.querySelector('.has-tip').getAttribute('tabindex')).toBe('0');
  });

  it('does not overwrite existing aria-label or aria-describedby', () => {
    new Tooltip(document).destroy();
    expect(document.querySelector('[aria-label="Existing"]').getAttribute('aria-label')).toBe(
      'Existing',
    );
    expect(document.querySelector('[aria-describedby]').hasAttribute('aria-label')).toBe(false);
  });
});
