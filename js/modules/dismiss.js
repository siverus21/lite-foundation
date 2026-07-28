/**
 * Dismissible panels — callouts, alerts, removable rows.
 *
 *   <div class="callout" data-closable>
 *     <button type="button" class="close-button" data-close aria-label="Закрыть"></button>
 *     …
 *   </div>
 *
 * The target is the closest `[data-closable]`, or the closest `.callout` when no
 * marker is present.
 *
 * Events on the target, bubbling:
 *   close.lf.dismiss   before removal, cancelable — `preventDefault()` keeps the
 *                      element and hands control to you (confirm on the server
 *                      first, then remove it yourself)
 *   closed.lf.dismiss  after removal
 */
import { Module } from '../core/Module.js';

export class Dismiss extends Module {
  static id = 'dismiss';

  constructor(root = document) {
    super(root);
    this.on(root, 'click', (event) => {
      const btn = event.target.closest('[data-close]');
      if (!btn) return;

      const target = btn.closest('[data-closable]') || btn.closest('.callout');
      // Toast draws its own [data-close] and handles it itself — don't fight over it.
      if (!target) return;

      event.preventDefault();
      event.stopPropagation();

      if (!this.emit(target, 'close', { trigger: btn }, { cancelable: true })) return;

      const parent = target.parentNode;
      target.remove();
      // The removed node is no longer in the tree, so the "done" event goes to the
      // parent — a delegated listener still sees it.
      this.emit(parent || document, 'closed', { target, trigger: btn });
    });
  }
}
