import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Dropdown } from '../js/modules/dropdown.js';

describe('Dropdown', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button type="button" data-dropdown-open="pane" aria-expanded="false">Open</button>
      <div class="dropdown-pane" id="pane" aria-hidden="true">
        <a href="#inside">Inside</a>
      </div>
      <button type="button" id="outside">Outside</button>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('opens pane and sets aria attributes', () => {
    const dd = new Dropdown(document);
    const trigger = document.querySelector('[data-dropdown-open]');
    const pane = document.getElementById('pane');

    trigger.click();
    expect(pane.classList.contains('is-open')).toBe(true);
    expect(pane.getAttribute('aria-hidden')).toBe('false');
    expect(pane.getAttribute('role')).toBe('dialog');
    expect(pane.getAttribute('aria-modal')).toBe('true');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe('pane');
    dd.destroy();
  });

  it('toggles closed on second trigger click', () => {
    const dd = new Dropdown(document);
    const trigger = document.querySelector('[data-dropdown-open]');
    const pane = document.getElementById('pane');

    trigger.click();
    trigger.click();
    expect(pane.classList.contains('is-open')).toBe(false);
    dd.destroy();
  });

  it('closes on Escape', () => {
    const dd = new Dropdown(document);
    document.querySelector('[data-dropdown-open]').click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.getElementById('pane').classList.contains('is-open')).toBe(false);
    dd.destroy();
  });

  it('closes on outside click', () => {
    const dd = new Dropdown(document);
    document.querySelector('[data-dropdown-open]').click();
    document.getElementById('outside').click();
    expect(document.getElementById('pane').classList.contains('is-open')).toBe(false);
    dd.destroy();
  });

  it('ignores a trigger that points at a missing pane id', () => {
    const dd = new Dropdown(document);
    const trigger = document.querySelector('[data-dropdown-open]');
    trigger.setAttribute('data-dropdown-open', 'missing-pane');

    expect(() => trigger.click()).not.toThrow();
    expect(document.getElementById('pane').classList.contains('is-open')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    dd.destroy();
  });

  it('traps Tab focus inside an open pane', () => {
    document.body.innerHTML = `
      <button type="button" data-dropdown-open="pane">Open</button>
      <div class="dropdown-pane" id="pane" aria-hidden="true">
        <a href="#one" id="first">One</a>
        <a href="#two" id="last">Two</a>
      </div>
      <button type="button" id="outside">Outside</button>
    `;
    const dd = new Dropdown(document);
    document.querySelector('[data-dropdown-open]').click();

    const pane = document.getElementById('pane');
    const first = document.getElementById('first');
    const last = document.getElementById('last');
    expect(pane.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(first);

    last.focus();
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
    expect(document.activeElement).toBe(last);

    dd.destroy();
  });

  it('marks unrelated body children inert while open', () => {
    document.body.innerHTML = `
      <button type="button" data-dropdown-open="pane">Open</button>
      <div class="dropdown-pane" id="pane" aria-hidden="true"><a href="#in">In</a></div>
      <div id="other"><button type="button" id="outside">Outside</button></div>
    `;
    const dd = new Dropdown(document);
    document.querySelector('[data-dropdown-open]').click();

    expect(document.getElementById('other').inert).toBe(true);
    expect(document.querySelector('[data-dropdown-open]').inert).toBe(false);

    dd.closeAll();
    expect(document.getElementById('other').inert).toBe(false);
    dd.destroy();
  });

  it('closeAll only affects panes owned by this instance', () => {
    document.body.innerHTML = `
      <div id="a">
        <button type="button" data-dropdown-open="pane-a">A</button>
        <div class="dropdown-pane" id="pane-a" aria-hidden="true"><a href="#a">a</a></div>
      </div>
      <div id="b">
        <button type="button" data-dropdown-open="pane-b">B</button>
        <div class="dropdown-pane" id="pane-b" aria-hidden="true"><a href="#b">b</a></div>
      </div>
    `;
    const rootA = document.getElementById('a');
    const rootB = document.getElementById('b');
    const ddA = new Dropdown(rootA);
    const ddB = new Dropdown(rootB);
    const paneA = document.getElementById('pane-a');
    const paneB = document.getElementById('pane-b');

    rootA.querySelector('[data-dropdown-open]').click();
    rootB.querySelector('[data-dropdown-open]').click();
    expect(paneA.classList.contains('is-open')).toBe(true);
    expect(paneB.classList.contains('is-open')).toBe(true);

    ddA.closeAll();
    expect(paneA.classList.contains('is-open')).toBe(false);
    expect(paneB.classList.contains('is-open')).toBe(true);

    ddA.destroy();
    ddB.destroy();
  });
});
