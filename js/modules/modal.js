/**
 * Native <dialog> modal.
 * Open:  [data-dialog-open="dialogId"]
 * Close: [data-dialog-close] inside dialog, Esc, click on backdrop
 */
import { Module } from '../core/Module.js';
import { lockScroll, unlockScroll } from '../core/scroll-lock.js';

export class Modal extends Module {
  constructor(root = document) {
    super(root);
    this._lastFocus = null;
    this.#mountDialogs();
    this.#bind();
  }

  #mountDialogs() {
    this.root.querySelectorAll('dialog.modal').forEach((dialog) => {
      if (dialog.parentElement !== document.body) {
        document.body.appendChild(dialog);
      }
      this.on(dialog, 'close', () => {
        document.body.classList.remove('is-modal-open');
        unlockScroll();
        const restore = this._lastFocus;
        this._lastFocus = null;
        // Native dialog also restores focus; re-focus with preventScroll after that.
        requestAnimationFrame(() => {
          restore?.focus?.({ preventScroll: true });
        });
      });
    });
  }

  #bind() {
    this.on(this.root, 'click', (event) => this.#onClick(event));
  }

  #onClick(event) {
    const openBtn = event.target.closest('[data-dialog-open]');
    if (openBtn) {
      event.preventDefault();
      const id = openBtn.getAttribute('data-dialog-open');
      const dialog = document.getElementById(id);
      if (!dialog || typeof dialog.showModal !== 'function' || dialog.open) return;
      this._lastFocus = openBtn;
      lockScroll();
      document.body.classList.add('is-modal-open');
      dialog.showModal();
      return;
    }

    const closeBtn = event.target.closest('[data-dialog-close]');
    if (closeBtn) {
      event.preventDefault();
      const dialog = closeBtn.closest('dialog');
      if (dialog && typeof dialog.close === 'function') dialog.close();
      return;
    }

    const dialog = event.target.closest('dialog.modal');
    if (dialog && event.target === dialog) {
      dialog.close();
    }
  }
}
