import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Offcanvas } from '../js/modules/offcanvas.js';
import { resetScrollLock } from '../js/core/scroll-lock.js';

describe('Offcanvas', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetScrollLock();
    document.body.innerHTML = `
      <button type="button" data-offcanvas-open="panel">Open</button>
      <div class="offcanvas" id="panel" aria-hidden="true">
        <button type="button" data-offcanvas-close>Close</button>
        <a href="#section">Nav</a>
      </div>
    `;
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
    document.querySelectorAll('.offcanvas-backdrop').forEach((el) => el.remove());
    resetScrollLock();
  });

  it('creates a single backdrop and moves panel to body', () => {
    const oc = new Offcanvas(document);
    expect(document.querySelectorAll('.offcanvas-backdrop').length).toBe(1);
    expect(document.getElementById('panel').parentElement).toBe(document.body);

    new Offcanvas(document);
    expect(document.querySelectorAll('.offcanvas-backdrop').length).toBe(1);
    oc.destroy();
  });

  it('opens panel with aria and scroll lock', () => {
    const oc = new Offcanvas(document);
    const panel = document.getElementById('panel');
    const trigger = document.querySelector('[data-offcanvas-open]');

    trigger.click();
    expect(panel.classList.contains('is-open')).toBe(true);
    expect(panel.getAttribute('aria-hidden')).toBe('false');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.body.classList.contains('is-offcanvas-open')).toBe(true);
    expect(document.body.classList.contains('is-scroll-locked')).toBe(true);

    oc.destroy();
  });

  it('preserves scroll offset when opening', () => {
    window.scrollTo(0, 240);
    const oc = new Offcanvas(document);
    document.querySelector('[data-offcanvas-open]').click();

    expect(document.body.dataset.lfScrollY).toBe('240');
    expect(document.body.style.top).toBe('-240px');

    oc.destroy();
  });

  it('closes on Escape and restores aria-expanded', async () => {
    const oc = new Offcanvas(document);
    const trigger = document.querySelector('[data-offcanvas-open]');
    const panel = document.getElementById('panel');
    trigger.click();
    // flush open() requestAnimationFrame that adds is-visible
    await vi.runAllTimersAsync();
    expect(panel.classList.contains('is-open')).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await vi.runAllTimersAsync();

    expect(panel.classList.contains('is-open')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    oc.destroy();
  });
});
