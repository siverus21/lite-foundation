import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputRecipes } from '../js/modules/input-recipes.js';

describe('InputRecipes', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="input-group password-input">
        <input class="input-group-field" type="password" value="secret">
        <button type="button" data-password-toggle
                data-text-show="Show" data-text-hide="Hide"
                data-label-show="Show password" data-label-hide="Hide password"
                aria-pressed="false" aria-label="Show password">Show</button>
      </div>
      <div class="input-group search-input">
        <input class="input-group-field" type="search" placeholder="Search…" value="query">
        <button type="button" data-search-clear aria-label="Clear">×</button>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('toggles password visibility and aria-pressed', () => {
    const mod = new InputRecipes(document);
    const field = document.querySelector('.password-input .input-group-field');
    const btn = document.querySelector('[data-password-toggle]');
    const events = [];
    field.addEventListener('toggled.lf.input-recipes', (e) => events.push(e.detail));

    btn.click();
    expect(field.type).toBe('text');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.textContent).toBe('Hide');
    expect(events[0]).toMatchObject({ visible: true });

    btn.click();
    expect(field.type).toBe('password');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.textContent).toBe('Show');

    mod.destroy();
  });

  it('clears the search field and emits cleared', () => {
    const mod = new InputRecipes(document);
    const field = document.querySelector('.search-input .input-group-field');
    const events = [];
    field.addEventListener('cleared.lf.input-recipes', (e) => events.push(e.detail));

    document.querySelector('[data-search-clear]').click();
    expect(field.value).toBe('');
    expect(events).toHaveLength(1);

    mod.destroy();
  });
});
