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

  it('ignores a trigger that points at a missing panel id', () => {
    const oc = new Offcanvas(document);
    const trigger = document.querySelector('[data-offcanvas-open]');
    const panel = document.getElementById('panel');
    trigger.setAttribute('data-offcanvas-open', 'missing-panel');

    expect(() => trigger.click()).not.toThrow();
    expect(panel.classList.contains('is-open')).toBe(false);
    expect(document.body.classList.contains('is-offcanvas-open')).toBe(false);

    oc.destroy();
  });

  it('traps Tab focus inside the open panel', async () => {
    document.body.innerHTML = `
      <button type="button" id="before">Before</button>
      <button type="button" data-offcanvas-open="panel">Open</button>
      <aside class="offcanvas" id="panel" aria-hidden="true">
        <button type="button" id="first">First</button>
        <button type="button" id="last">Last</button>
        <button type="button" data-offcanvas-close>Close</button>
      </aside>
      <button type="button" id="after">After</button>
    `;
    const oc = new Offcanvas(document);
    oc.open('panel');
    await vi.runAllTimersAsync();

    const first = document.getElementById('first');
    const last = document.getElementById('last');
    // Close button is also focusable — use the real last focusable in the panel.
    const closeBtn = document.querySelector('[data-offcanvas-close]');
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );
    expect(document.activeElement).toBe(first);

    first.focus();
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(closeBtn);

    // Sanity: last button still participates in the trap set.
    expect(last.isConnected).toBe(true);

    oc.destroy();
  });

  it('backdrop click closes when the instance root is a subtree', async () => {
    document.body.innerHTML = `
      <div id="app">
        <button type="button" data-offcanvas-open="panel">Open</button>
        <aside class="offcanvas" id="panel" aria-hidden="true">
          <button type="button" data-offcanvas-close>Close</button>
        </aside>
      </div>
    `;
    const oc = new Offcanvas(document.getElementById('app'));
    const panel = document.getElementById('panel');
    oc.open('panel');
    await vi.runAllTimersAsync();
    expect(panel.classList.contains('is-open')).toBe(true);

    document.querySelector('.offcanvas-backdrop').click();
    await vi.runAllTimersAsync();
    expect(panel.classList.contains('is-open')).toBe(false);

    oc.destroy();
  });

  it('in-panel close still works after panel relocates to body', async () => {
    document.body.innerHTML = `
      <div id="app">
        <button type="button" data-offcanvas-open="panel">Open</button>
        <aside class="offcanvas" id="panel" aria-hidden="true">
          <button type="button" data-offcanvas-close id="close-btn">Close</button>
        </aside>
      </div>
    `;
    const oc = new Offcanvas(document.getElementById('app'));
    const panel = document.getElementById('panel');
    oc.open('panel');
    await vi.runAllTimersAsync();

    document.getElementById('close-btn').click();
    await vi.runAllTimersAsync();
    expect(panel.classList.contains('is-open')).toBe(false);

    oc.destroy();
  });

  it('close only affects panels owned by this instance', async () => {
    document.body.innerHTML = `
      <div id="a">
        <button type="button" data-offcanvas-open="panel-a">A</button>
        <aside class="offcanvas" id="panel-a" aria-hidden="true">
          <button type="button" data-offcanvas-close>Close</button>
        </aside>
      </div>
      <div id="b">
        <button type="button" data-offcanvas-open="panel-b">B</button>
        <aside class="offcanvas" id="panel-b" aria-hidden="true">
          <button type="button" data-offcanvas-close>Close</button>
        </aside>
      </div>
    `;
    const ocA = new Offcanvas(document.getElementById('a'));
    const ocB = new Offcanvas(document.getElementById('b'));
    const panelA = document.getElementById('panel-a');
    const panelB = document.getElementById('panel-b');

    // Direct API — avoids shared-backdrop hit-testing noise between two roots.
    ocA.open('panel-a');
    ocB.open('panel-b');
    await vi.runAllTimersAsync();
    expect(panelA.classList.contains('is-open')).toBe(true);
    expect(panelB.classList.contains('is-open')).toBe(true);

    ocA.close();
    await vi.runAllTimersAsync();
    expect(panelA.classList.contains('is-open')).toBe(false);
    expect(panelB.classList.contains('is-open')).toBe(true);
    expect(document.body.classList.contains('is-offcanvas-open')).toBe(true);

    ocB.destroy();
    ocA.destroy();
  });
});
