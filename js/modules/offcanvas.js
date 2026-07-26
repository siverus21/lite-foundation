/**
 * Off-canvas drawer.
 * Open:  [data-offcanvas-open="panelId"]
 * Close: [data-offcanvas-close], backdrop, Esc
 */
import { Module } from '../core/Module.js';
import { lockScroll, unlockScroll } from '../core/scroll-lock.js';

export class Offcanvas extends Module {
  constructor(root = document) {
    super(root);
    this._lastFocus = null;
    this.#ensureBackdrop();
    this.#mountPanels();
    this.#bind();
  }

  #ensureBackdrop() {
    if (document.querySelector('.offcanvas-backdrop[data-lf-offcanvas-backdrop]')) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'offcanvas-backdrop';
    backdrop.setAttribute('data-offcanvas-close', '');
    backdrop.setAttribute('data-lf-offcanvas-backdrop', '');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  #mountPanels() {
    this.mountAll('.offcanvas', (panel) => {
      if (!panel.hasAttribute('aria-modal')) panel.setAttribute('aria-modal', 'true');
      if (!panel.hasAttribute('role')) panel.setAttribute('role', 'dialog');
      if (panel.parentElement !== document.body) {
        document.body.appendChild(panel);
      }
    });
  }

  #bind() {
    this.on(
      this.root,
      'click',
      (event) => {
        const openBtn = event.target.closest('[data-offcanvas-open]');
        if (openBtn) {
          event.preventDefault();
          event.stopPropagation();
          this.open(openBtn.getAttribute('data-offcanvas-open'), openBtn);
          return;
        }

        const closeBtn = event.target.closest('[data-offcanvas-close]');
        if (closeBtn) {
          event.preventDefault();
          event.stopPropagation();
          this.close();
          return;
        }

        const navLink = event.target.closest('.offcanvas.is-open a[href^="#"]');
        if (navLink) this.close();
      },
      true,
    );

    this.on(document, 'keydown', (event) => {
      if (event.key === 'Escape') this.close();
    });
  }

  open(id, trigger = null) {
    const panel = document.getElementById(id);
    const backdrop = document.querySelector('.offcanvas-backdrop');
    if (!panel || !id || panel.classList.contains('is-open')) return;

    this._lastFocus = trigger || document.activeElement;

    document.querySelectorAll(`[data-offcanvas-open="${id}"]`).forEach((btn) => {
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-controls', id);
    });

    // Lock scroll before is-offcanvas-open: that class alone must not apply
    // position:fixed without a saved top offset (would jump the page to 0).
    lockScroll();
    document.body.classList.add('is-offcanvas-open');
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.add('is-open');

    if (backdrop) {
      backdrop.style.pointerEvents = 'none';
      backdrop.setAttribute('aria-hidden', 'false');
      window.setTimeout(() => {
        if (backdrop.classList.contains('is-open')) backdrop.style.pointerEvents = '';
      }, 0);
    }

    requestAnimationFrame(() => {
      panel.classList.add('is-visible');
      backdrop?.classList.add('is-open');
      const focusable = panel.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus?.({ preventScroll: true });
    });
  }

  close() {
    const panels = document.querySelectorAll('.offcanvas.is-open');
    const backdrop = document.querySelector('.offcanvas-backdrop');

    panels.forEach((panel) => {
      const id = panel.id;
      if (id) {
        document.querySelectorAll(`[data-offcanvas-open="${id}"]`).forEach((btn) => {
          btn.setAttribute('aria-expanded', 'false');
        });
      }

      panel.classList.remove('is-visible');

      const finish = () => {
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        panel.removeEventListener('transitionend', onEnd);
      };

      const onEnd = (event) => {
        if (event.target !== panel || event.propertyName !== 'transform') return;
        finish();
      };

      panel.addEventListener('transitionend', onEnd);
      window.setTimeout(finish, 350);
    });

    if (backdrop) {
      backdrop.classList.remove('is-open');
      backdrop.style.pointerEvents = '';
      backdrop.setAttribute('aria-hidden', 'true');
    }

    document.body.classList.remove('is-offcanvas-open');
    unlockScroll();

    const restore = this._lastFocus;
    this._lastFocus = null;
    if (restore && typeof restore.focus === 'function') {
      restore.focus({ preventScroll: true });
    }
  }

  destroy() {
    this.close();
    super.destroy();
  }
}
