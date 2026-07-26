import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Dismiss } from '../js/modules/dismiss.js';

describe('Dismiss', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="callout" data-closable>
        <button type="button" data-close aria-label="Close">×</button>
        <p>Hello</p>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('removes closable parent on data-close click', () => {
    const dismiss = new Dismiss(document);
    expect(document.querySelector('.callout')).toBeTruthy();
    document.querySelector('[data-close]').click();
    expect(document.querySelector('.callout')).toBeNull();
    dismiss.destroy();
  });
});
