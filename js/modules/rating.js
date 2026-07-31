/**
 * Star rating.
 *
 * Interactive markup (the module builds the stars):
 *   <div class="rating" data-rating data-rating-value="3" data-rating-max="5"
 *        data-rating-name="score"></div>
 *
 * It generates a `role="radiogroup"` of `role="radio"` buttons plus a hidden
 * input, so the value posts with the surrounding form and needs no markup
 * boilerplate.
 *
 * Readonly display: add `data-readonly` and skip this module entirely — the fill
 * is pure CSS via the `--lf-rating-value` percentage (see scss/components/rating).
 *
 * Settings (attributes on the root):
 *   data-rating-value="3"     initial value; kept in sync as the visitor picks
 *   data-rating-max="5"       number of stars
 *   data-rating-name="score"  name of the generated hidden input
 *   data-rating-clearable     clicking the current star clears back to 0
 *
 * Event on the root: `changed.lf.rating`, detail { value, max }.
 * Command on the root: `lf:rating:set` { value }.
 * Instance API: value(el), set(el, value).
 */
import { Module } from '../core/Module.js';
import { bool, clamp, int, str } from '../core/attrs.js';

const NAV_KEYS = ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Home', 'End'];

export class Rating extends Module {
  static id = 'rating';
  static lazySelector = '[data-rating]:not([data-readonly])';

  constructor(root = document) {
    super(root);
    this.mountOnce('[data-rating]:not([data-readonly])', (el) => this.#build(el));
  }

  #build(el) {
    const max = Math.max(1, int(el, 'data-rating-max', 5));
    const value = clamp(int(el, 'data-rating-value', 0), 0, max);

    el.setAttribute('role', 'radiogroup');
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Rating');
    el.innerHTML = '';

    const stars = [];
    for (let i = 1; i <= max; i += 1) {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'rating-star';
      star.setAttribute('role', 'radio');
      star.setAttribute('aria-label', `${i} ${i === 1 ? 'star' : 'stars'}`);
      star.setAttribute('aria-checked', 'false');
      star.setAttribute('tabindex', '-1');
      star.dataset.ratingStar = String(i);
      el.appendChild(star);
      stars.push(star);
    }

    const input = document.createElement('input');
    input.type = 'hidden';
    const name = str(el, 'data-rating-name');
    if (name) input.name = name;
    el.appendChild(input);

    const state = { el, max, value, stars, input, hover: 0, clearable: bool(el, 'data-rating-clearable') };
    this.states.set(el, state);
    input.value = String(value);
    this.#render(state);

    this.on(el, 'click', (event) => {
      const star = event.target.closest('[data-rating-star]');
      if (!star) return;
      const picked = Number(star.dataset.ratingStar);
      this.#setValue(state, state.clearable && picked === state.value ? 0 : picked);
    });

    this.on(el, 'mouseover', (event) => {
      const star = event.target.closest('[data-rating-star]');
      if (!star) return;
      state.hover = Number(star.dataset.ratingStar);
      this.#render(state);
    });

    this.on(el, 'mouseleave', () => {
      state.hover = 0;
      this.#render(state);
    });

    this.on(el, 'keydown', (event) => {
      if (!NAV_KEYS.includes(event.key)) return;
      event.preventDefault();

      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') this.#setValue(state, state.value + 1);
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') this.#setValue(state, state.value - 1);
      else if (event.key === 'Home') this.#setValue(state, 1);
      else if (event.key === 'End') this.#setValue(state, state.max);

      state.stars[Math.max(0, state.value - 1)]?.focus();
    });

    this.commands(el, {
      set: (event) => this.set(el, event.detail?.value),
    });
  }

  #setValue(state, next) {
    state.value = clamp(Math.round(next), 0, state.max);
    state.hover = 0;
    this.#render(state);
    state.input.value = String(state.value);
    // Mirrored back into the attribute so the current pick survives a
    // `refreshModules()` — the rebuild reads its initial value from here.
    state.el.setAttribute('data-rating-value', String(state.value));
    this.emit(state.el, 'changed', { value: state.value, max: state.max });
  }

  #render(state) {
    const active = state.hover || state.value;
    state.el.style.setProperty('--lf-rating-value', `${(active / state.max) * 100}%`);

    state.stars.forEach((star, i) => {
      const isRovingTarget = i === Math.max(0, state.value - 1);
      star.classList.toggle('is-filled', i < state.value);
      star.classList.toggle('is-hover', Boolean(state.hover) && i < state.hover);
      star.setAttribute('aria-checked', String(i + 1 === state.value));
      star.setAttribute('tabindex', isRovingTarget ? '0' : '-1');
    });
  }

  /** @param {Element} el root or any element inside it */
  value(el) {
    return this.stateFor(el)?.value ?? null;
  }

  /** @param {Element} el @param {number} value */
  set(el, value) {
    const state = this.stateFor(el);
    if (!state || !Number.isFinite(Number(value))) return null;
    this.#setValue(state, Number(value));
    return state.value;
  }
}
