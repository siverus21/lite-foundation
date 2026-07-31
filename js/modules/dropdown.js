/**
 * Dropdown panes.
 *
 *   <button type="button" data-dropdown-open="filters">Фильтры</button>
 *   <div class="dropdown-pane" id="filters">…</div>
 *
 * Opening closes any other pane, so only one is ever on screen. Closes on an
 * outside click, on Escape (via the shared dispatcher) and on a second click of
 * the trigger.
 *
 * While open: Tab is trapped inside the pane, the pane gets `role="dialog"` +
 * `aria-modal="true"` (required for a valid modal attr on a non-dialog host),
 * and top-level body children that do not contain the pane/trigger are marked
 * `inert` (clicks on them retarget to a non-inert ancestor so light-dismiss still
 * works).
 *
 * For a single element anchored to its trigger with light-dismiss handled by the
 * browser, prefer Popover — this module exists for the Foundation pane shape and
 * works without the popover API.
 *
 * Events on the pane, bubbling:
 *   opened.lf.dropdown  detail { trigger }
 *   closed.lf.dropdown
 * Commands on the pane:
 *   lf:dropdown:open
 *   lf:dropdown:close
 */
import { Module } from '../core/Module.js';
import { onEscape } from '../core/global-events.js';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export class Dropdown extends Module {
  static id = 'dropdown';
  static lazySelector = '[data-dropdown-open], .dropdown-pane';

  constructor(root = document) {
    super(root);
    this._lastFocus = null;
    /** Panes owned by this instance — close/open never touches foreign roots. @type {Set<Element>} */
    this._panes = new Set();
    /** Elements this instance set `inert` on — cleared on close. @type {Element[]} */
    this._inerted = [];

    const hasMarkup =
      root.querySelector('[data-dropdown-open]') || root.querySelector('.dropdown-pane');
    if (!hasMarkup) return;

    this.#bind();
  }

  #bind() {
    // Capture phase: a trigger inside another interactive widget must still win.
    this.on(
      this.root,
      'click',
      (event) => {
        const trigger = event.target.closest('[data-dropdown-open]');
        if (trigger && this.root.contains(trigger)) {
          event.preventDefault();
          event.stopPropagation();
          const pane = document.getElementById(trigger.getAttribute('data-dropdown-open'));
          if (!pane || !this._panes.has(pane)) return;

          const willOpen = !pane.classList.contains('is-open');
          this.closeAll();
          if (willOpen) this.open(pane, trigger);
          return;
        }

        if (!event.target.closest('.dropdown-pane.is-open')) this.closeAll();
      },
      true,
    );

    onEscape(this.signal, () => this.closeAll());
    this.#bindFocusTrap();

    this.mountAll('.dropdown-pane', (pane) => {
      this._panes.add(pane);
      this.commands(pane, {
        open: () => {
          const trigger =
            this.root.querySelector(`[data-dropdown-open="${pane.id}"]`) ||
            document.querySelector(`[data-dropdown-open="${pane.id}"]`);
          this.closeAll();
          this.open(pane, trigger);
        },
        close: () => this.closeAll(),
      });
    });
  }

  #bindFocusTrap() {
    this.on(document, 'keydown', (event) => {
      if (event.key !== 'Tab') return;
      const pane = [...this._panes].find((el) => el.classList.contains('is-open'));
      if (!pane) return;

      const focusable = [...pane.querySelectorAll(FOCUSABLE)].filter(
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

  /** @param {Element} pane @param {Element|null} [trigger] */
  open(pane, trigger = null) {
    if (!pane || !this._panes.has(pane)) return;
    pane.classList.add('is-open');
    pane.setAttribute('aria-hidden', 'false');
    // aria-modal is only valid on dialog/alertdialog — set role if the author omitted it.
    if (!pane.hasAttribute('role')) pane.setAttribute('role', 'dialog');
    pane.setAttribute('aria-modal', 'true');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-controls', pane.id);
      this._lastFocus = trigger;
    }
    this.#setBackgroundInert(true, pane, trigger);
    pane.querySelector(FOCUSABLE)?.focus?.();
    this.emit(pane, 'opened', { trigger });
  }

  closeAll() {
    const open = [...this._panes].filter((pane) => pane.classList.contains('is-open'));

    open.forEach((pane) => {
      pane.classList.remove('is-open');
      pane.setAttribute('aria-hidden', 'true');
      pane.removeAttribute('aria-modal');
      if (pane.id) {
        document.querySelectorAll(`[data-dropdown-open="${pane.id}"]`).forEach((trigger) => {
          trigger.setAttribute('aria-expanded', 'false');
        });
      }
    });

    if (open.length) this.#setBackgroundInert(false);

    const restore = this._lastFocus;
    this._lastFocus = null;
    if (restore && typeof restore.focus === 'function') restore.focus();

    open.forEach((pane) => this.emit(pane, 'closed'));
  }

  /**
   * Mark top-level body children inert when they do not host the open pane or
   * its trigger. Nested siblings stay interactive when they share a wrapper —
   * focus trap covers that case.
   * @param {boolean} on
   * @param {Element} [pane]
   * @param {Element|null} [trigger]
   */
  #setBackgroundInert(on, pane, trigger = null) {
    if (!on) {
      for (const el of this._inerted) {
        if (el.isConnected) el.inert = false;
      }
      this._inerted = [];
      document.body?.removeAttribute('data-lf-dropdown-inert');
      return;
    }

    if (!pane || !document.body || !('inert' in HTMLElement.prototype)) return;

    this.#setBackgroundInert(false);
    document.body.setAttribute('data-lf-dropdown-inert', '');

    for (const child of document.body.children) {
      if (child === pane || child.contains(pane)) continue;
      if (trigger && (child === trigger || child.contains(trigger))) continue;
      if (child.inert) continue;
      child.inert = true;
      this._inerted.push(child);
    }
  }

  destroy() {
    this.closeAll();
    this._panes.clear();
    super.destroy();
  }
}
