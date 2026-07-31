/**
 * OTP / PIN input — one box per character over a single hidden form field.
 *
 *   <div class="otp" data-otp data-otp-length="6" data-otp-name="code"></div>
 *
 * The first box carries `autocomplete="one-time-code"`, so iOS/Android offer the
 * SMS code; when the platform (or a paste) delivers the whole code at once it is
 * spread across the boxes.
 *
 * Settings (attributes on the root):
 *   data-otp-length="6"       number of boxes (default 6)
 *   data-otp-name="code"      name of the hidden input holding the joined value
 *   data-otp-type="text"      'digits' (default) or 'text'
 *   data-otp-autosubmit       submit the closest form once the code is complete
 *
 * Events on the root:
 *   changed.lf.otp     detail { value, complete }
 *   completed.lf.otp   detail { value } — fires once per completed code
 *
 * Command events on the root:
 *   lf:otp:clear     empties every box and focuses the first
 *   lf:otp:set       { value }
 *   lf:otp:invalid   { invalid }  — red border + shake (wrong code from server)
 *
 * API: value(el), clear(el), set(el, value).
 */
import { Module } from '../core/Module.js';
import { clamp, int, str } from '../core/attrs.js';
import { t } from '../core/i18n.js';

export class Otp extends Module {
  static id = 'otp';

  constructor(root = document) {
    super(root);
    this.mountOnce('[data-otp]', (el) => this.#setup(el));
  }

  #setup(el) {
    const length = clamp(int(el, 'data-otp-length', 6) || 6, 2, 12);
    const digits = (str(el, 'data-otp-type') || 'digits') === 'digits';
    const fields = [];

    for (let i = 0; i < length; i += 1) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'otp-field';
      input.maxLength = 1;
      input.inputMode = digits ? 'numeric' : 'text';
      if (digits) input.pattern = '[0-9]*';
      input.autocomplete = i === 0 ? 'one-time-code' : 'off';
      input.setAttribute('aria-label', t('otpDigit', i + 1, length));
      el.appendChild(input);
      fields.push(input);
    }

    let hidden = null;
    const name = str(el, 'data-otp-name');
    if (name) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = name;
      el.appendChild(hidden);
    }

    const state = { el, fields, hidden, digits, length, complete: false };
    this.states.set(el, state);

    this.on(el, 'input', (event) => {
      const field = event.target.closest('.otp-field');
      if (!field) return;

      const index = fields.indexOf(field);
      const raw = state.digits ? field.value.replace(/\D/g, '') : field.value;

      // One physical keystroke can deliver several characters (autofill, paste,
      // some Android keyboards) — spread them over the following boxes.
      if (raw.length > 1) {
        Otp.#spread(state, raw, index);
        fields[Math.min(length - 1, index + raw.length)]?.focus();
      } else {
        field.value = raw;
        if (raw) fields[index + 1]?.focus();
      }

      this.#sync(el, state);
    });

    this.on(el, 'keydown', (event) => {
      const field = event.target.closest('.otp-field');
      if (!field) return;
      const index = fields.indexOf(field);

      if (event.key === 'Backspace' && !field.value && index > 0) {
        event.preventDefault();
        fields[index - 1].value = '';
        fields[index - 1].focus();
        this.#sync(el, state);
        return;
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        fields[index - 1].focus();
      }
      if (event.key === 'ArrowRight' && index < length - 1) {
        event.preventDefault();
        fields[index + 1].focus();
      }
    });

    this.on(el, 'paste', (event) => {
      const text = event.clipboardData?.getData('text') || '';
      if (!text) return;
      event.preventDefault();
      const value = state.digits ? text.replace(/\D/g, '') : text;
      Otp.#spread(state, value, 0);
      fields[Math.min(length - 1, value.length)]?.focus();
      this.#sync(el, state);
    });

    // Selecting the content on focus makes overtyping a filled box work.
    this.on(el, 'focusin', (event) => event.target.closest('.otp-field')?.select?.());

    this.commands(el, {
      clear: () => this.clear(el),
      set: (event) => this.set(el, event.detail?.value || ''),
      invalid: (event) => {
        const invalid = event.detail?.invalid !== false;
        el.toggleAttribute('data-invalid', invalid);
        if (invalid) fields[0]?.focus();
      },
    });
  }

  static #spread(state, value, from) {
    const chars = [...value];
    for (let i = from; i < state.fields.length; i += 1) {
      state.fields[i].value = chars[i - from] ?? '';
    }
  }

  #sync(el, state) {
    const value = state.fields.map((field) => field.value).join('');
    if (state.hidden) state.hidden.value = value;
    el.removeAttribute('data-invalid');

    const complete = value.length === state.length;
    this.emit(el, 'changed', { value, complete });

    if (complete && !state.complete) {
      state.complete = true;
      this.emit(el, 'completed', { value });
      if (el.hasAttribute('data-otp-autosubmit')) el.closest('form')?.requestSubmit?.();
    }
    if (!complete) state.complete = false;
  }

  /** @param {Element} el root or any element inside it */
  value(el) {
    const state = this.stateFor(el);
    return state ? state.fields.map((field) => field.value).join('') : null;
  }

  /** @param {Element} el */
  clear(el) {
    const state = this.stateFor(el);
    if (!state) return;
    state.fields.forEach((field) => {
      field.value = '';
    });
    state.fields[0]?.focus();
    this.#sync(state.el, state);
  }

  /** @param {Element} el @param {string} value */
  set(el, value) {
    const state = this.stateFor(el);
    if (!state) return;
    Otp.#spread(state, state.digits ? String(value).replace(/\D/g, '') : String(value), 0);
    this.#sync(state.el, state);
  }
}
