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

  constructor(root = document) {
    super(root);
    this._lastFocus = null;

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
        if (trigger) {
          event.preventDefault();
          event.stopPropagation();
          const pane = document.getElementById(trigger.getAttribute('data-dropdown-open'));
          if (!pane) return;

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

    this.mountAll('.dropdown-pane', (pane) => {
      this.commands(pane, {
        open: () => {
          const trigger = document.querySelector(`[data-dropdown-open="${pane.id}"]`);
          this.closeAll();
          this.open(pane, trigger);
        },
        close: () => this.closeAll(),
      });
    });
  }

  /** @param {Element} pane @param {Element|null} [trigger] */
  open(pane, trigger = null) {
    pane.classList.add('is-open');
    pane.setAttribute('aria-hidden', 'false');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-controls', pane.id);
      this._lastFocus = trigger;
    }
    pane.querySelector(FOCUSABLE)?.focus?.();
    this.emit(pane, 'opened', { trigger });
  }

  closeAll() {
    const open = [...document.querySelectorAll('.dropdown-pane.is-open')];

    open.forEach((pane) => {
      pane.classList.remove('is-open');
      pane.setAttribute('aria-hidden', 'true');
    });

    document.querySelectorAll('[data-dropdown-open][aria-expanded="true"]').forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'false');
    });

    const restore = this._lastFocus;
    this._lastFocus = null;
    if (restore && typeof restore.focus === 'function') restore.focus();

    open.forEach((pane) => this.emit(pane, 'closed'));
  }

  destroy() {
    this.closeAll();
    super.destroy();
  }
}
