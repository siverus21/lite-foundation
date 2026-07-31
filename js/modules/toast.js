/**
 * Toast / notification stack.
 *
 * Show one from anywhere — no instance reference needed:
 *   document.dispatchEvent(new CustomEvent('lf:toast:show', {
 *     detail: { title, message, variant, duration, action },
 *   }));
 *
 * `action: { label, onClick, dismissOnClick }` renders an extra button ("В корзину",
 * "Повторить") — see the Toast docs page for a full "add to cart" example wired to
 * a real request.
 *
 * Declarative trigger: `[data-toast-trigger]` with `data-toast-title` /
 * `data-toast-message` / `data-toast-variant` / `data-toast-duration`.
 *
 * Closing: `[data-close]` inside the toast, or automatically after `duration` ms
 * (default 4000; `0` keeps it until dismissed).
 *
 * At most MAX_VISIBLE toasts stay on screen — a burst (or several sticky ones)
 * pushes the oldest out instead of growing the stack past the viewport, where a
 * toast would be scrolled out of reach and impossible to close.
 *
 * Events (on the toast element, bubbling):
 *   shown.lf.toast    detail { toast, options }
 *   hidden.lf.toast   detail { toast }
 * Commands on document:
 *   lf:toast:show     detail as in show()
 *   lf:toast:clear    dismiss everything on screen
 */
import { Module } from '../core/Module.js';
import { num, str } from '../core/attrs.js';
import { afterTransition } from '../core/transition.js';
import { t } from '../core/i18n.js';

const DEFAULT_DURATION = 4000;
const EXIT_DURATION = 350;
const MAX_VISIBLE = 5;

export class Toast extends Module {
  static id = 'toast';

  constructor(root = document) {
    super(root);

    this.commands(document, {
      show: (event) => this.show(event.detail || {}),
      clear: () => this.clear(),
    });

    this.on(root, 'click', (event) => {
      const trigger = event.target.closest('[data-toast-trigger]');
      if (!trigger) return;
      event.preventDefault();
      this.show({
        title: str(trigger, 'data-toast-title') || undefined,
        message: str(trigger, 'data-toast-message') || trigger.textContent.trim(),
        variant: str(trigger, 'data-toast-variant') || undefined,
        duration: trigger.hasAttribute('data-toast-duration')
          ? num(trigger, 'data-toast-duration', DEFAULT_DURATION)
          : undefined,
      });
    });

    this.on(document, 'click', (event) => {
      const closeBtn = event.target.closest('.toast [data-close]');
      if (!closeBtn) return;
      const toastEl = closeBtn.closest('.toast');
      if (toastEl) this.dismiss(toastEl);
    });
  }

  /**
   * The stack lives on <body>, not inside `this.root`: it is positioned relative
   * to the viewport, and a toast triggered from inside a transformed/overflowing
   * container would otherwise be clipped by it.
   */
  #ensureStack() {
    let stack = document.querySelector('.toast-stack[data-lf-toast-stack]');
    if (!stack) {
      stack = document.createElement('div');
      // Default corner: top-end (logical). Override via data-toast-position on
      // <body> or a pre-existing `.toast-stack` in markup.
      const position =
        document.body?.getAttribute('data-toast-position') ||
        document.documentElement?.getAttribute('data-toast-position') ||
        'top-end';
      stack.className = `toast-stack ${position}`;
      stack.setAttribute('data-lf-toast-stack', '');
      stack.setAttribute('aria-live', 'polite');
      stack.setAttribute('aria-atomic', 'true');
      document.body.appendChild(stack);
    }
    return stack;
  }

  /** Dismiss the oldest toasts still on screen once the stack goes over the cap. */
  #trim(stack) {
    const alive = stack.querySelectorAll('.toast:not([data-lf-dismissing])');
    for (let i = 0; i < alive.length - MAX_VISIBLE; i += 1) {
      this.dismiss(alive[i]);
    }
  }

  /**
   * @param {{
   *   title?: string,
   *   message?: string,
   *   variant?: string,
   *   duration?: number,
   *   action?: { label: string, onClick?: (toastEl: HTMLElement) => void, dismissOnClick?: boolean },
   * }} options
   * @returns {HTMLElement} the toast element
   */
  show(options = {}) {
    const { title, message, variant, duration = DEFAULT_DURATION, action } = options;
    const stack = this.#ensureStack();
    const toastEl = document.createElement('div');
    toastEl.className = 'toast';
    if (variant) toastEl.classList.add(variant);
    toastEl.setAttribute('role', 'status');

    if (title) {
      const titleEl = document.createElement('strong');
      titleEl.className = 'toast-title';
      titleEl.textContent = title;
      toastEl.appendChild(titleEl);
    }

    if (message) {
      const messageEl = document.createElement('div');
      messageEl.className = 'toast-message';
      messageEl.textContent = message;
      toastEl.appendChild(messageEl);
    }

    if (action && action.label) {
      const actionBtn = document.createElement('button');
      actionBtn.type = 'button';
      actionBtn.className = 'toast-action';
      actionBtn.textContent = action.label;
      this.on(actionBtn, 'click', () => {
        action.onClick?.(toastEl);
        if (action.dismissOnClick !== false) this.dismiss(toastEl);
      });
      toastEl.appendChild(actionBtn);
    }

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('data-close', '');
    closeBtn.setAttribute('aria-label', t('close'));
    toastEl.appendChild(closeBtn);

    stack.appendChild(toastEl);
    this.#trim(stack);
    this.raf(() => toastEl.classList.add('is-visible'));

    // A non-finite duration (e.g. Number('') / Number('4s') from a malformed
    // data-toast-duration) must not silently turn into a toast that never closes.
    const ms = Number.isFinite(duration) ? duration : DEFAULT_DURATION;
    if (ms > 0) this.timeout(() => this.dismiss(toastEl), ms);

    this.emit(toastEl, 'shown', { toast: toastEl, options });
    return toastEl;
  }

  /** @param {Element} toastEl */
  dismiss(toastEl) {
    if (!toastEl || !toastEl.isConnected) return;
    // Auto-dismiss, trim and a close click can all target the same toast — without
    // this guard each call would add another listener + exit timer.
    if (toastEl.hasAttribute('data-lf-dismissing')) return;
    toastEl.setAttribute('data-lf-dismissing', '');
    toastEl.classList.remove('is-visible');

    afterTransition(
      toastEl,
      () => {
        toastEl.remove();
        this.emit(document, 'hidden', { toast: toastEl });
      },
      { fallback: EXIT_DURATION, signal: this.signal },
    );
  }

  /** Dismiss every toast currently on screen. */
  clear() {
    document
      .querySelectorAll('.toast-stack .toast:not([data-lf-dismissing])')
      .forEach((toastEl) => this.dismiss(toastEl));
  }
}
