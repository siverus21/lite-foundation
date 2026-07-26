/**
 * Dropdown panes.
 * Toggle: [data-dropdown-open="paneId"]
 * Close: outside click, Esc, second click on trigger
 */
import { Module } from '../core/Module.js';

export class Dropdown extends Module {
  constructor(root = document) {
    super(root);
    this._lastFocus = null;
    this.#bind();
  }

  #bind() {
    this.on(
      this.root,
      'click',
      (event) => {
        const trigger = event.target.closest('[data-dropdown-open]');
        if (trigger) {
          event.preventDefault();
          event.stopPropagation();
          const id = trigger.getAttribute('data-dropdown-open');
          const pane = document.getElementById(id);
          if (!pane) return;

          const willOpen = !pane.classList.contains('is-open');
          this.closeAll();
          if (willOpen) this.#open(pane, trigger);
          return;
        }

        if (!event.target.closest('.dropdown-pane.is-open')) {
          this.closeAll();
        }
      },
      true,
    );

    this.on(document, 'keydown', (event) => {
      if (event.key === 'Escape') this.closeAll();
    });
  }

  #open(pane, trigger) {
    pane.classList.add('is-open');
    pane.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-controls', pane.id);
    this._lastFocus = trigger;
    const focusable = pane.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus?.();
  }

  closeAll() {
    document.querySelectorAll('.dropdown-pane.is-open').forEach((pane) => {
      pane.classList.remove('is-open');
      pane.setAttribute('aria-hidden', 'true');
    });

    document.querySelectorAll('[data-dropdown-open][aria-expanded="true"]').forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'false');
    });

    const restore = this._lastFocus;
    this._lastFocus = null;
    if (restore && typeof restore.focus === 'function') restore.focus();
  }

  destroy() {
    this.closeAll();
    super.destroy();
  }
}
