/**
 * Off-canvas drawer.
 *
 *   <button type="button" data-offcanvas-open="menu">Меню</button>
 *   <aside class="offcanvas left" id="menu">…</aside>
 *
 * Opening locks page scroll and moves focus into the panel; closing restores both.
 * Panels are relocated to <body> so a transformed or overflow-hidden ancestor
 * can't clip a fixed-position drawer.
 *
 * Closes on `[data-offcanvas-close]`, the backdrop, Escape, and in-page anchor
 * clicks inside the panel.
 *
 * Focus is trapped while open: the panel is `aria-modal`, so Tab must not walk
 * behind it into the page.
 *
 * Events on the panel, bubbling:
 *   opened.lf.offcanvas  detail { trigger }
 *   closed.lf.offcanvas
 * Commands:
 *   lf:offcanvas:open   on the panel
 *   lf:offcanvas:close  on the panel
 */
import { Module } from '../core/Module.js';
import { lockScroll, unlockScroll } from '../core/scroll-lock.js';
import { onEscape } from '../core/global-events.js';
import { afterTransition } from '../core/transition.js';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export class Offcanvas extends Module {
  static id = 'offcanvas';

  constructor(root = document) {
    super(root);
    this._lastFocus = null;
    /** Panels owned by this instance (even after relocate to <body>). @type {Set<Element>} */
    this._panels = new Set();
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
      this._panels.add(panel);
      if (!panel.hasAttribute('aria-modal')) panel.setAttribute('aria-modal', 'true');
      if (!panel.hasAttribute('role')) panel.setAttribute('role', 'dialog');
      if (panel.parentElement !== document.body) document.body.appendChild(panel);

      this.commands(panel, {
        open: () => this.open(panel.id),
        close: () => this.close(),
      });
    });
  }

  #bind() {
    // Open triggers stay in the original root (panels relocate to <body>).
    this.on(
      this.root,
      'click',
      (event) => {
        const openBtn = event.target.closest('[data-offcanvas-open]');
        if (!openBtn) return;
        if (this.root !== document && !this.root.contains(openBtn)) return;
        event.preventDefault();
        event.stopPropagation();
        this.open(openBtn.getAttribute('data-offcanvas-open'), openBtn);
      },
      true,
    );

    // Backdrop + in-panel [data-offcanvas-close] + in-panel hash links live on
    // <body> after relocate — a subtree `this.root` never sees those clicks.
    this.on(
      document,
      'click',
      (event) => {
        const closeBtn = event.target.closest('[data-offcanvas-close]');
        if (closeBtn) {
          const panel = closeBtn.closest('.offcanvas');
          const isBackdrop =
            closeBtn.classList.contains('offcanvas-backdrop') ||
            closeBtn.hasAttribute('data-lf-offcanvas-backdrop');

          if (isBackdrop) {
            if ([...this._panels].some((el) => el.classList.contains('is-open'))) {
              event.preventDefault();
              this.close();
            }
            return;
          }

          if (panel && this._panels.has(panel)) {
            event.preventDefault();
            event.stopPropagation();
            this.close();
          }
          return;
        }

        const navLink = event.target.closest('.offcanvas.is-open a[href^="#"]');
        if (!navLink) return;
        const panel = navLink.closest('.offcanvas');
        if (panel && this._panels.has(panel)) this.close();
      },
      true,
    );

    onEscape(this.signal, () => this.close());

    // Focus trap for the open panel (aria-modal promises the rest of the page is
    // out of reach). Only trap for panels this instance owns.
    this.on(document, 'keydown', (event) => {
      if (event.key !== 'Tab') return;
      const panel = [...this._panels].find((el) => el.classList.contains('is-open'));
      if (!panel) return;

      const focusable = [...panel.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /** @param {string} id @param {Element|null} [trigger] */
  open(id, trigger = null) {
    const panel = document.getElementById(id);
    const backdrop = document.querySelector('.offcanvas-backdrop');
    if (!panel || !id || !this._panels.has(panel) || panel.classList.contains('is-open')) return;

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
      // Swallowing the click that opened the drawer would close it again, so the
      // backdrop only becomes clickable on the next tick.
      backdrop.style.pointerEvents = 'none';
      backdrop.setAttribute('aria-hidden', 'false');
      this.timeout(() => {
        if (backdrop.classList.contains('is-open')) backdrop.style.pointerEvents = '';
      }, 0);
    }

    this.raf(() => {
      panel.classList.add('is-visible');
      backdrop?.classList.add('is-open');
      panel.querySelector(FOCUSABLE)?.focus?.({ preventScroll: true });
      this.emit(panel, 'opened', { trigger });
    });
  }

  close() {
    const panels = [...this._panels].filter((panel) => panel.classList.contains('is-open'));
    const backdrop = document.querySelector('.offcanvas-backdrop');
    if (!panels.length) return;

    panels.forEach((panel) => {
      if (panel.id) {
        document.querySelectorAll(`[data-offcanvas-open="${panel.id}"]`).forEach((btn) => {
          btn.setAttribute('aria-expanded', 'false');
        });
      }

      panel.classList.remove('is-visible');
      afterTransition(
        panel,
        () => {
          panel.classList.remove('is-open');
          panel.setAttribute('aria-hidden', 'true');
          this.emit(panel, 'closed');
        },
        { property: 'transform', fallback: 350, signal: this.signal },
      );
    });

    // Shared backdrop / scroll lock — leave alone while another instance still has a panel open.
    const foreignOpen = [...document.querySelectorAll('.offcanvas.is-open')].some(
      (panel) => !panels.includes(panel),
    );
    if (!foreignOpen) {
      if (backdrop) {
        backdrop.classList.remove('is-open');
        backdrop.style.pointerEvents = '';
        backdrop.setAttribute('aria-hidden', 'true');
      }
      document.body.classList.remove('is-offcanvas-open');
      unlockScroll();
    }

    const restore = this._lastFocus;
    this._lastFocus = null;
    if (restore && typeof restore.focus === 'function') restore.focus({ preventScroll: true });
  }

  destroy() {
    this.close();
    this._panels.clear();
    super.destroy();
  }
}
