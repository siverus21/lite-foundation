/**
 * Tooltip a11y helpers (visuals are pure CSS via `.has-tip[data-tip]`).
 *
 *   <button type="button" class="has-tip" data-tip="Подсказка">?</button>
 *
 * Attribute is `data-tip` on purpose — Foundation still watches `[data-tooltip]`.
 * Does **not** inject `tabindex="0"`: that polluted the tab order. Put the tip
 * on a naturally focusable control, or set tabindex yourself when keyboard
 * reveal is required. CSS shows the tip on `:hover` / `:focus` / `:focus-visible`.
 *
 * On mount: copies `data-tip` into `aria-label` when neither `aria-label` nor
 * `aria-describedby` is present. No events / commands.
 */
import { Module } from '../core/Module.js';

export class Tooltip extends Module {
  static id = 'tooltip';

  constructor(root = document) {
    super(root);
    this.mountAll('.has-tip[data-tip]', (el) => {
      const tip = el.getAttribute('data-tip') || '';
      if (!el.hasAttribute('aria-label') && !el.getAttribute('aria-describedby')) {
        el.setAttribute('aria-label', tip);
      }
    });
  }
}
