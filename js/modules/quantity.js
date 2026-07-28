/**
 * Quantity input — «− value +» around a real <input type="number">.
 *
 * Minimal markup (buttons are built for you):
 *   <div class="quantity" data-quantity>
 *     <input class="quantity-input" type="number" name="qty" value="1">
 *   </div>
 *
 * Full markup is respected too — put `data-quantity-decrease` /
 * `data-quantity-increase` on your own buttons and nothing is generated.
 *
 * Settings (attributes on the root; `min`/`max`/`step` on the input win if set):
 *   data-quantity-min="1"          lower bound (default 0)
 *   data-quantity-max="99"         upper bound (default Infinity)
 *   data-quantity-step="1"         increment
 *   data-quantity-precision="2"    decimals (derived from step when omitted)
 *   data-quantity-wrap             max + 1 → min, min − 1 → max
 *   data-quantity-hold             press and hold to repeat
 *   data-quantity-debounce="400"   delay for `committed.lf.quantity` (ms)
 *   data-quantity-name="qty"       name for a generated input
 *
 * Events on the root:
 *   changed.lf.quantity    every change, detail { value, previous, reason, min, max, step }
 *                          reason: 'increase' | 'decrease' | 'input' | 'api' | 'limits'
 *   committed.lf.quantity  same detail, but debounced — one server request per burst
 *
 * Command events on the root (detail in brackets):
 *   lf:quantity:set        { value }
 *   lf:quantity:increase   { by? }
 *   lf:quantity:decrease   { by? }
 *   lf:quantity:limits     { min?, max?, step?, clamp? }  e.g. stock changed
 *   lf:quantity:busy       { busy }                       lock while a request runs
 *
 * Instance API: value(el), set(el, value), increase(el), decrease(el).
 * Every method accepts the root or any element inside it (e.g. the input).
 */
import { Module } from '../core/Module.js';
import { bool, clamp, num, toNumber } from '../core/attrs.js';

const HOLD_DELAY = 400;
const HOLD_INTERVAL = 90;

/** Decimals implied by the step, so 0.1 + 0.2 doesn't render as 0.30000000000000004. */
function precisionOf(step) {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
}

export class Quantity extends Module {
  static id = 'quantity';

  constructor(root = document) {
    super(root);
    this.mountOnce('[data-quantity]', (el) => this.#setup(el));
  }

  #setup(el) {
    const input = Quantity.#ensureInput(el);
    const state = this.#readOptions(el, input);
    this.states.set(el, state);

    state.decrease = Quantity.#ensureButton(el, 'decrease', input);
    state.increase = Quantity.#ensureButton(el, 'increase', input);

    this.#write(el, state, toNumber(input.value, state.min), { reason: 'init', silent: true });

    this.on(el, 'click', (event) => {
      if (event.target.closest('[data-quantity-decrease]')) this.decrease(el);
      else if (event.target.closest('[data-quantity-increase]')) this.increase(el);
    });

    // Typing is not clamped mid-word (you couldn't type "12" with max 20 if it
    // were), only on blur / Enter / change.
    this.on(input, 'change', () => this.set(el, toNumber(input.value, state.value), 'input'));
    this.on(input, 'keydown', (event) => {
      if (event.key === 'Enter') this.set(el, toNumber(input.value, state.value), 'input');
    });

    if (bool(el, 'data-quantity-hold')) this.#bindHold(el, state);

    this.commands(el, {
      set: (event) => this.set(el, event.detail?.value, 'api'),
      increase: (event) => this.increase(el, event.detail?.by),
      decrease: (event) => this.decrease(el, event.detail?.by),
      limits: (event) => this.#setLimits(el, event.detail || {}),
      busy: (event) => {
        const busy = event.detail?.busy !== false;
        el.toggleAttribute('data-busy', busy);
        el.setAttribute('aria-busy', String(busy));
        for (const button of [state.decrease, state.increase]) {
          if (button) button.disabled = busy || button.dataset.lfLimitDisabled === 'true';
        }
      },
    });
  }

  static #ensureInput(el) {
    const existing = el.querySelector('input');
    if (existing) {
      existing.classList.add('quantity-input');
      return existing;
    }

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'quantity-input';
    input.value = el.getAttribute('data-quantity-value') || '0';
    const name = el.getAttribute('data-quantity-name');
    if (name) input.name = name;
    el.appendChild(input);
    return input;
  }

  static #ensureButton(el, kind, input) {
    const existing = el.querySelector(`[data-quantity-${kind}]`);
    if (existing) return existing;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quantity-button';
    button.setAttribute(`data-quantity-${kind}`, '');
    button.setAttribute('aria-label', kind === 'increase' ? 'Increase' : 'Decrease');
    button.textContent = kind === 'increase' ? '+' : '−';
    if (kind === 'decrease') el.insertBefore(button, input);
    else el.appendChild(button);
    return button;
  }

  #readOptions(el, input) {
    const step = Math.abs(num(input, 'step', num(el, 'data-quantity-step', 1)) || 1);
    return {
      el,
      input,
      min: num(input, 'min', num(el, 'data-quantity-min', 0)),
      max: num(input, 'max', num(el, 'data-quantity-max', Infinity)),
      step,
      precision: num(el, 'data-quantity-precision', precisionOf(step)),
      wrap: bool(el, 'data-quantity-wrap'),
      debounce: num(el, 'data-quantity-debounce', 0),
      value: 0,
      commitTimer: null,
    };
  }

  #clamp(value, state) {
    if (!Number.isFinite(value)) return state.min === -Infinity ? 0 : state.min;
    if (state.wrap) {
      if (value > state.max) return state.min;
      if (value < state.min) return state.max === Infinity ? state.min : state.max;
    }
    return clamp(value, state.min, state.max);
  }

  #round(value, state) {
    return Number(value.toFixed(clamp(state.precision, 0, 10)));
  }

  #write(el, state, next, { reason, silent = false } = {}) {
    const previous = state.value;
    const value = this.#round(this.#clamp(next, state), state);

    state.value = value;
    state.input.value = String(value);
    state.input.setAttribute('aria-valuenow', String(value));

    this.#syncButton(state.decrease, !state.wrap && value <= state.min);
    this.#syncButton(state.increase, !state.wrap && value >= state.max);

    if (silent || value === previous) return value;

    const detail = {
      value,
      previous,
      reason,
      min: state.min,
      max: state.max,
      step: state.step,
    };
    this.emit(el, 'changed', detail);

    // Debounced twin: bind cart/stock requests to this one and a visitor
    // clicking «+» five times fast costs a single call.
    this.clearTimer(state.commitTimer);
    state.commitTimer = this.timeout(() => this.emit(el, 'committed', detail), state.debounce);

    return value;
  }

  #syncButton(button, atLimit) {
    if (!button) return;
    // Remembered so `lf:quantity:busy` can re-enable only the buttons that a
    // limit isn't already holding down.
    button.dataset.lfLimitDisabled = String(atLimit);
    button.disabled = atLimit;
    button.setAttribute('aria-disabled', String(atLimit));
  }

  #setLimits(el, { min, max, step, clamp: doClamp = true }) {
    const state = this.stateFor(el);
    if (!state) return;

    if (Number.isFinite(Number(min))) state.min = Number(min);
    if (max !== undefined) state.max = max === null ? Infinity : toNumber(max, state.max);
    if (Number.isFinite(Number(step)) && Number(step) > 0) {
      state.step = Number(step);
      state.precision = precisionOf(state.step);
    }

    state.input.min = state.min === -Infinity ? '' : String(state.min);
    state.input.max = state.max === Infinity ? '' : String(state.max);
    state.input.step = String(state.step);

    this.#write(state.el, state, state.value, { reason: 'limits', silent: !doClamp });
  }

  #bindHold(el, state) {
    let delayTimer = null;
    let repeatTimer = null;

    const stop = () => {
      this.clearTimer(delayTimer);
      delayTimer = null;
      if (repeatTimer !== null) clearInterval(repeatTimer);
      repeatTimer = null;
    };

    const start = (event) => {
      const button = event.target.closest('[data-quantity-decrease], [data-quantity-increase]');
      if (!button || button.disabled) return;
      const run = button === state.increase ? () => this.increase(el) : () => this.decrease(el);
      stop();
      delayTimer = this.timeout(() => {
        repeatTimer = setInterval(run, HOLD_INTERVAL);
      }, HOLD_DELAY);
    };

    this.on(el, 'pointerdown', start);
    this.on(el, 'pointerup', stop);
    this.on(el, 'pointerleave', stop);
    this.on(el, 'pointercancel', stop);
    this.on(window, 'blur', stop);
    this.signal.addEventListener('abort', stop, { once: true });
  }

  /** @param {Element} el root or any element inside it */
  value(el) {
    return this.stateFor(el)?.value ?? null;
  }

  /** @param {Element} el @param {number} value @param {string} [reason] */
  set(el, value, reason = 'api') {
    const state = this.stateFor(el);
    if (!state) return null;
    return this.#write(state.el, state, toNumber(value, state.value), { reason });
  }

  /** @param {Element} el @param {number} [by] */
  increase(el, by) {
    const state = this.stateFor(el);
    if (!state) return null;
    return this.#write(state.el, state, state.value + (toNumber(by, state.step) || state.step), {
      reason: 'increase',
    });
  }

  /** @param {Element} el @param {number} [by] */
  decrease(el, by) {
    const state = this.stateFor(el);
    if (!state) return null;
    return this.#write(state.el, state, state.value - (toNumber(by, state.step) || state.step), {
      reason: 'decrease',
    });
  }
}
