/**
 * Character counter for inputs and textareas.
 *
 *   <textarea data-char-counter maxlength="280"></textarea>
 *
 * The counter element is generated after the field and kept in sync. With
 * `maxlength` set the browser already blocks extra input, so the counter is
 * pure feedback; without it (use `data-char-counter-max="280"`) the field stays
 * editable and the counter goes red — the pattern social apps use.
 *
 * Settings (attributes on the field):
 *   data-char-counter-max="280"    soft limit (no maxlength → over-typing allowed)
 *   data-char-counter-warn="0.8"   share of the limit that turns the counter amber
 *   data-char-counter-template="{count} / {max}"
 *
 * Event on the field: `changed.lf.char-counter`, detail { count, max, remaining, over }.
 */
import { Module } from '../core/Module.js';
import { num, str } from '../core/attrs.js';

const DEFAULT_TEMPLATE = '{count} / {max}';

export class CharCounter extends Module {
  static id = 'char-counter';

  constructor(root = document) {
    super(root);
    // mountOnce: the counter element is generated, so a second init on an
    // overlapping root would leave two of them under the same field.
    this.mountOnce('[data-char-counter]', (el) => this.#setup(el));
  }

  #setup(field) {
    const max = num(field, 'maxlength', 0) || num(field, 'data-char-counter-max', 0);
    if (!max) return;

    const output = document.createElement('output');
    output.className = 'char-counter';
    // `aria-live="polite"` would read the counter on every keystroke; the field
    // description is enough, screen readers announce maxlength themselves.
    output.setAttribute('aria-hidden', 'true');
    field.insertAdjacentElement('afterend', output);

    const state = {
      max,
      warn: num(field, 'data-char-counter-warn', 0.8),
      template: str(field, 'data-char-counter-template') || DEFAULT_TEMPLATE,
      output,
    };
    this.states.set(field, state);

    const render = () => this.#render(field, state);
    this.on(field, 'input', render);
    this.on(field, 'change', render);
    render();
  }

  #render(field, state) {
    const count = String(field.value ?? '').length;
    const { max } = state;
    const over = count > max;

    state.output.textContent = state.template
      .replace('{count}', String(count))
      .replace('{max}', String(max))
      .replace('{remaining}', String(max - count));

    state.output.classList.toggle('is-warning', !over && count >= max * state.warn);
    state.output.classList.toggle('is-over', over);
    field.setAttribute('aria-invalid', String(over));

    this.emit(field, 'changed', { count, max, remaining: max - count, over });
  }
}
