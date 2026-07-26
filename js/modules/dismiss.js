/**
 * Dismissible panels (callouts, alerts).
 * Close: [data-close] inside [data-closable] (or closest .callout)
 */
import { Module } from '../core/Module.js';

export class Dismiss extends Module {
  constructor(root = document) {
    super(root);
    this.on(root, 'click', (event) => {
      const btn = event.target.closest('[data-close]');
      if (!btn) return;

      event.preventDefault();
      event.stopPropagation();

      const target = btn.closest('[data-closable]') || btn.closest('.callout');
      if (!target) return;

      target.dispatchEvent(
        new CustomEvent('lf:dismiss', { bubbles: true, detail: { trigger: btn } }),
      );
      target.remove();
    });
  }
}
