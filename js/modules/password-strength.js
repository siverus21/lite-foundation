/**
 * Password strength meter on top of the native <meter> element.
 *
 *   <input type="password" data-password-strength>
 *
 * A `<meter min="0" max="4">` plus a label are generated after the field, so the
 * colour ramp comes from the browser (`:-moz-meter-optimum` and friends, already
 * styled by `styles.meter`) instead of hand-rolled classes.
 *
 * Scoring is deliberately transparent — length plus character classes. It is
 * feedback for the visitor, not a security control: enforce policy on the
 * server. Swap in zxcvbn by listening for `changed.lf.password-strength` and
 * setting `meter.value` yourself, or override `PasswordStrength.score`.
 *
 * Settings (attributes on the field):
 *   data-password-strength-min="3"   below this the form is marked invalid
 *   data-password-strength-labels="Слабый|Простой|Средний|Хороший|Надёжный"
 *
 * Event on the field: `changed.lf.password-strength`, detail { score, label, ok, checks }.
 */
import { Module } from '../core/Module.js';
import { num, str } from '../core/attrs.js';

const DEFAULT_LABELS = ['Слишком короткий', 'Слабый', 'Средний', 'Хороший', 'Надёжный'];

export class PasswordStrength extends Module {
  static id = 'password-strength';

  constructor(root = document) {
    super(root);
    // mountOnce: meter + label are generated markup (see CharCounter).
    this.mountOnce('[data-password-strength]', (el) => this.#setup(el));
  }

  /**
   * 0…4. Exposed as a static so an app can reuse (or replace) the heuristic.
   * @param {string} value
   */
  static score(value) {
    const checks = {
      length: value.length >= 8,
      long: value.length >= 12,
      lower: /[a-zа-я]/.test(value),
      upper: /[A-ZА-Я]/.test(value),
      digit: /\d/.test(value),
      symbol: /[^\w\s]/.test(value),
    };

    if (!value) return { score: 0, checks };
    if (!checks.length) return { score: 1, checks };

    const classes = [checks.lower, checks.upper, checks.digit, checks.symbol].filter(Boolean).length;
    let score = 1 + Math.min(2, classes - 1);
    if (checks.long && classes >= 3) score = 4;

    return { score: Math.max(1, Math.min(4, score)), checks };
  }

  #setup(field) {
    const labels = (
      str(field, 'data-password-strength-labels') || DEFAULT_LABELS.join('|')
    ).split('|');
    const min = num(field, 'data-password-strength-min', 0);

    const wrap = document.createElement('div');
    wrap.className = 'password-strength';

    // Attributes rather than properties: the colour ramp is driven by the
    // low/high/optimum *attributes*, and not every DOM implementation reflects
    // the property assignments back onto them.
    const meter = document.createElement('meter');
    meter.setAttribute('min', '0');
    meter.setAttribute('max', '4');
    meter.setAttribute('low', '2');
    meter.setAttribute('high', '3');
    meter.setAttribute('optimum', '4');
    meter.setAttribute('value', '0');
    meter.setAttribute('aria-hidden', 'true');

    const label = document.createElement('p');
    label.className = 'password-strength-label';

    const text = document.createElement('span');
    // Announced politely: the strength changes meaning, unlike a raw counter.
    text.setAttribute('aria-live', 'polite');
    label.appendChild(text);

    wrap.append(meter, label);
    field.insertAdjacentElement('afterend', wrap);

    const render = () => {
      const { score, checks } = PasswordStrength.score(field.value || '');
      meter.setAttribute('value', String(score));
      text.textContent = field.value ? labels[score] || '' : '';

      const ok = score >= min;
      field.setAttribute('aria-invalid', String(Boolean(field.value) && !ok));

      this.emit(field, 'changed', { score, label: labels[score] || '', ok, checks });
    };

    this.on(field, 'input', render);
    render();
  }
}
