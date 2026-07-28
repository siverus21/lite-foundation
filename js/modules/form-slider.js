/**
 * Range slider for `.slider[data-slider]` markup (the Foundation JS slider shape).
 *
 *   <div class="slider" data-slider data-start="0" data-end="100" data-step="5"
 *        data-initial-start="40">
 *     <span class="slider-handle" data-slider-handle></span>
 *     <span class="slider-fill" data-slider-fill></span>
 *     <input type="hidden" name="price">
 *   </div>
 *
 * Prefer `<input type="range">` (styled by `styles.forms`) when you don't need
 * this markup — it's accessible and draggable for free. This module exists for
 * pages already built on Foundation's slider DOM.
 *
 * Settings (attributes on the root):
 *   data-start="0"          minimum
 *   data-end="100"          maximum
 *   data-step="1"           grid the value snaps to, dragging included
 *   data-initial-start="40" starting value
 *   class="vertical"        vertical orientation
 *
 * Position is published as `--lf-slider-percent` on the root and applied by CSS,
 * so both orientations are styled in one place instead of by inline styles here.
 *
 * Event on the root: `changed.lf.form-slider`, detail { value, min, max }.
 * Command on the root: `lf:form-slider:set` { value }.
 * Instance API: value(el), set(el, value).
 *
 * Id is `form-slider` (not `slider`) so it never collides with the Swiper
 * module (`static id = 'swiper'`). Markup stays Foundation-shaped: `.slider[data-slider]`.
 */
import { Module } from '../core/Module.js';
import { clamp, num, snap } from '../core/attrs.js';

export class FormSlider extends Module {
  static id = 'form-slider';

  constructor(root = document) {
    super(root);
    this.mountOnce('[data-slider]', (el) => this.#setup(el));
  }

  #setup(el) {
    const handle = el.querySelector('[data-slider-handle]');
    if (!handle) return;

    const min = num(el, 'data-start', 0);
    const max = num(el, 'data-end', 100);
    const state = {
      el,
      handle,
      fill: el.querySelector('[data-slider-fill]'),
      input: el.querySelector('input[type="hidden"]'),
      min,
      max: max > min ? max : min + 100,
      step: Math.abs(num(el, 'data-step', 1)) || 1,
      vertical: el.classList.contains('vertical'),
      value: min,
      dragging: false,
    };
    this.states.set(el, state);

    handle.setAttribute('role', 'slider');
    handle.setAttribute('tabindex', handle.getAttribute('tabindex') || '0');
    if (state.vertical) handle.setAttribute('aria-orientation', 'vertical');

    this.#apply(state, num(el, 'data-initial-start', state.min), { silent: true });

    this.on(el, 'pointerdown', (event) => this.#startDrag(state, event));
    this.on(handle, 'keydown', (event) => this.#onKeydown(state, event));
    this.commands(el, { set: (event) => this.set(el, event.detail?.value) });
  }

  #apply(state, next, { silent = false } = {}) {
    const previous = state.value;
    // Snapping applies to pointer drags too: an unsnapped drag writes values like
    // 43.371428571428574 into the submitted field.
    state.value = snap(clamp(next, state.min, state.max), state.step, state.min);

    const percent = ((state.value - state.min) / (state.max - state.min)) * 100;
    state.el.style.setProperty('--lf-slider-percent', `${percent}%`);

    if (state.input) state.input.value = String(state.value);
    state.handle.setAttribute('aria-valuenow', String(state.value));
    state.handle.setAttribute('aria-valuemin', String(state.min));
    state.handle.setAttribute('aria-valuemax', String(state.max));

    if (silent || state.value === previous) return state.value;
    this.emit(state.el, 'changed', { value: state.value, min: state.min, max: state.max });
    return state.value;
  }

  #valueFromPointer(state, clientX, clientY) {
    const rect = state.el.getBoundingClientRect();
    const ratio = state.vertical
      ? 1 - (clientY - rect.top) / rect.height
      : (clientX - rect.left) / rect.width;
    return state.min + clamp(ratio, 0, 1) * (state.max - state.min);
  }

  #startDrag(state, event) {
    if (state.el.classList.contains('disabled') || state.el.hasAttribute('disabled')) return;
    event.preventDefault();

    state.dragging = true;
    state.handle.classList.add('is-dragging');
    state.fill?.classList.add('is-dragging');
    this.#moveTo(state, event);

    // Scoped to one drag: aborting on pointerup keeps the move handler off the
    // window between drags, and `this.signal` covers a destroy() mid-drag.
    const drag = new AbortController();
    const signal = AbortSignal.any
      ? AbortSignal.any([drag.signal, this.signal])
      : drag.signal;

    const stop = () => {
      if (!state.dragging) return;
      state.dragging = false;
      state.handle.classList.remove('is-dragging');
      state.fill?.classList.remove('is-dragging');
      drag.abort();
    };

    window.addEventListener('pointermove', (moveEvent) => this.#moveTo(state, moveEvent), { signal });
    window.addEventListener('touchmove', (moveEvent) => this.#moveTo(state, moveEvent), {
      signal,
      passive: false,
    });
    window.addEventListener('pointerup', stop, { signal });
    window.addEventListener('touchend', stop, { signal });
    this.signal.addEventListener('abort', stop, { once: true });
  }

  #moveTo(state, event) {
    if (!state.dragging) return;
    const point = event.touches ? event.touches[0] : event;
    if (!point) return;
    this.#apply(state, this.#valueFromPointer(state, point.clientX, point.clientY));
  }

  #onKeydown(state, event) {
    const keys = {
      ArrowRight: () => state.value + state.step,
      ArrowUp: () => state.value + state.step,
      ArrowLeft: () => state.value - state.step,
      ArrowDown: () => state.value - state.step,
      Home: () => state.min,
      End: () => state.max,
      PageUp: () => state.value + state.step * 10,
      PageDown: () => state.value - state.step * 10,
    };

    const next = keys[event.key];
    if (!next) return;
    event.preventDefault();
    this.#apply(state, next());
  }

  /** @param {Element} el root or any element inside it */
  value(el) {
    return this.stateFor(el)?.value ?? null;
  }

  /** @param {Element} el @param {number} value */
  set(el, value) {
    const state = this.stateFor(el);
    if (!state || !Number.isFinite(Number(value))) return null;
    return this.#apply(state, Number(value));
  }
}
