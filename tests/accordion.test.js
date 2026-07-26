import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Accordion } from '../js/modules/accordion.js';

function accordionHtml({ multi = false } = {}) {
  return `
    <div class="accordion" data-accordion${multi ? ' data-multi-expand="true"' : ''}>
      <details class="accordion-item" open>
        <summary class="accordion-title">One</summary>
        <div class="accordion-content"><p>A</p></div>
      </details>
      <details class="accordion-item">
        <summary class="accordion-title">Two</summary>
        <div class="accordion-content"><p>B</p></div>
      </details>
    </div>
  `;
}

describe('Accordion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = accordionHtml();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('wraps content in accordion-content-inner', () => {
    new Accordion(document).destroy();
    expect(document.querySelector('.accordion-content-inner')).toBeTruthy();
  });

  it('opens a closed panel on summary click', async () => {
    const acc = new Accordion(document);
    const second = document.querySelectorAll('details.accordion-item')[1];
    const summary = second.querySelector('summary');

    summary.click();
    await vi.runAllTimersAsync();

    expect(second.classList.contains('is-open')).toBe(true);
    expect(second.open).toBe(true);
    acc.destroy();
  });

  it('closes previously open panel when multi-expand is off', async () => {
    const acc = new Accordion(document);
    const [first, second] = document.querySelectorAll('details.accordion-item');

    second.querySelector('summary').click();
    await vi.runAllTimersAsync();

    expect(first.classList.contains('is-open')).toBe(false);
    expect(second.classList.contains('is-open')).toBe(true);
    acc.destroy();
  });

  it('stops reacting after destroy and drops data-lf-enhanced', async () => {
    const acc = new Accordion(document);
    const root = document.querySelector('[data-accordion]');
    expect(root.hasAttribute('data-lf-enhanced')).toBe(true);

    acc.destroy();
    expect(root.hasAttribute('data-lf-enhanced')).toBe(false);

    const second = document.querySelectorAll('details.accordion-item')[1];
    second.querySelector('summary').click();
    await vi.runAllTimersAsync();
    // JS no longer toggles is-open; native details may set [open].
    expect(second.classList.contains('is-open')).toBe(false);
  });
});
