/**
 * Tooltip a11y helpers (visuals are pure CSS via .has-tip[data-tip]).
 * Attribute is data-tip on purpose — Foundation still watches [data-tooltip].
 */
import { Module } from '../core/Module.js';

export class Tooltip extends Module {
  constructor(root = document) {
    super(root);
    this.mountAll('.has-tip[data-tip]', (el) => {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
      const tip = el.getAttribute('data-tip') || '';
      if (!el.hasAttribute('aria-label') && !el.getAttribute('aria-describedby')) {
        el.setAttribute('aria-label', tip);
      }
    });
  }
}
