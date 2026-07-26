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
});
