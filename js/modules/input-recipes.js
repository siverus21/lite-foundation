/**
 * Behaviour for PasswordInput / SearchInput markup recipes.
 *
 * Password reveal:
 *   <div class="input-group password-input">
 *     <input class="input-group-field" type="password">
 *     <button type="button" data-password-toggle aria-pressed="false"
 *             aria-label="Show password" data-label-show="Show" data-label-hide="Hide">Show</button>
 *   </div>
 *
 * Search clear:
 *   <div class="input-group search-input">
 *     <input class="input-group-field" type="search" placeholder="…">
 *     <button type="button" data-search-clear aria-label="Clear">×</button>
 *   </div>
 *
 * Visuals live in `scss/components/forms/_input-recipes.scss`. This module only
 * toggles `type` / clears value — no generated markup.
 *
 * Events (bubble from the field / root group):
 *   toggled.lf.input-recipes  detail { visible, field }
 *   cleared.lf.input-recipes  detail { field }
 */
import { Module } from '../core/Module.js';
import { str } from '../core/attrs.js';

export class InputRecipes extends Module {
  static id = 'input-recipes';
  static lazySelector = '.password-input, .search-input, [data-password-toggle], [data-search-clear]';

  constructor(root = document) {
    super(root);

    this.on(root, 'click', (event) => {
      const toggle = event.target.closest('[data-password-toggle]');
      if (toggle && root.contains(toggle)) {
        event.preventDefault();
        this.#togglePassword(toggle);
        return;
      }

      const clear = event.target.closest('[data-search-clear]');
      if (clear && root.contains(clear)) {
        event.preventDefault();
        this.#clearSearch(clear);
      }
    });
  }

  /** @param {Element} button */
  #togglePassword(button) {
    const group = button.closest('.password-input') || button.parentElement;
    const field =
      group?.querySelector('input[type="password"], input[data-password-field]') ||
      group?.querySelector('.input-group-field');
    if (!(field instanceof HTMLInputElement)) return;

    const show = field.type === 'password';
    field.type = show ? 'text' : 'password';
    if (show) field.setAttribute('data-password-field', '');
    else field.removeAttribute('data-password-field');

    button.setAttribute('aria-pressed', show ? 'true' : 'false');
    const labelShow = str(button, 'data-label-show') || button.getAttribute('aria-label') || 'Show password';
    const labelHide = str(button, 'data-label-hide') || 'Hide password';
    const nextLabel = show ? labelHide : labelShow;
    button.setAttribute('aria-label', nextLabel);
    if (button.childElementCount === 0) button.textContent = show
      ? str(button, 'data-text-hide') || 'Hide'
      : str(button, 'data-text-show') || str(button, 'data-label-show') || 'Show';

    this.emit(field, 'toggled', { visible: show, field });
  }

  /** @param {Element} button */
  #clearSearch(button) {
    const group = button.closest('.search-input') || button.parentElement;
    const field = group?.querySelector('input[type="search"], .input-group-field');
    if (!(field instanceof HTMLInputElement)) return;

    field.value = '';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.focus();
    this.emit(field, 'cleared', { field });
  }
}
