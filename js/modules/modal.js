/**
 * Modal on the native <dialog> element.
 *
 *   <button type="button" data-dialog-open="signup">Регистрация</button>
 *   <dialog class="modal" id="signup">
 *     <button type="button" class="close-button" data-dialog-close aria-label="Закрыть"></button>
 *     …
 *   </dialog>
 *
 * `showModal()` gives us the top layer, the ::backdrop, focus containment and
 * Escape for free — this module only adds page-scroll locking, backdrop clicks,
 * focus restore and events.
 *
 * Events on the dialog, bubbling:
 *   opened.lf.modal  detail { trigger }
 *   closed.lf.modal  detail { returnValue }
 * Commands on the dialog:
 *   lf:modal:open
 *   lf:modal:close  { returnValue? }
 */
import { Module } from '../core/Module.js';
import { lockScroll, unlockScroll } from '../core/scroll-lock.js';

export class Modal extends Module {
  static id = 'modal';

  constructor(root = document) {
    super(root);
    this._lastFocus = null;
    this.#mountDialogs();
    this.on(this.root, 'click', (event) => this.#onClick(event));
  }

  #mountDialogs() {
    this.mountAll('dialog.modal', (dialog) => {
      // A dialog inside a transformed/overflow-hidden ancestor is clipped even in
      // the top layer, so it moves to <body>.
      if (dialog.parentElement !== document.body) document.body.appendChild(dialog);

      this.on(dialog, 'close', () => {
        document.body.classList.remove('is-modal-open');
        unlockScroll();
        const restore = this._lastFocus;
        this._lastFocus = null;
        // Native dialog also restores focus; re-focus with preventScroll after that.
        this.raf(() => restore?.focus?.({ preventScroll: true }));
        this.emit(dialog, 'closed', { returnValue: dialog.returnValue });
      });

      this.commands(dialog, {
        open: () => this.open(dialog),
        close: (event) => dialog.close?.(event.detail?.returnValue ?? ''),
      });
    });
  }

  /** @param {HTMLDialogElement} dialog @param {Element|null} [trigger] */
  open(dialog, trigger = null) {
    if (!dialog || typeof dialog.showModal !== 'function' || dialog.open) return;
    this._lastFocus = trigger || document.activeElement;
    lockScroll();
    document.body.classList.add('is-modal-open');
    dialog.showModal();
    this.emit(dialog, 'opened', { trigger });
  }

  #onClick(event) {
    const openBtn = event.target.closest('[data-dialog-open]');
    if (openBtn) {
      event.preventDefault();
      const dialog = document.getElementById(openBtn.getAttribute('data-dialog-open'));
      if (!dialog) return;
      this.open(dialog, openBtn);
      return;
    }

    const closeBtn = event.target.closest('[data-dialog-close]');
    if (closeBtn) {
      event.preventDefault();
      closeBtn.closest('dialog')?.close?.();
      return;
    }

    // A click that lands on the dialog element itself is a click on its padding
    // box — i.e. the backdrop area around the content.
    const dialog = event.target.closest('dialog.modal');
    if (dialog && event.target === dialog) dialog.close();
  }
}
