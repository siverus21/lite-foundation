/**
 * Popover — progressive enhancement around the native `popover` attribute.
 *
 * Markup:
 *   <button class="button" popovertarget="userMenu">Аккаунт</button>
 *   <div class="popover" id="userMenu" popover data-popover>…</div>
 *
 * What this module adds on top of the platform:
 *   • positioning next to the trigger for browsers without CSS anchor
 *     positioning (Chrome/Edge < 125, Safari < 26, Firefox < 147);
 *   • open/close, light dismiss and Escape for browsers without `popover`
 *     at all (Chrome/Edge < 114, Safari < 17, Firefox < 125);
 *   • one event vocabulary in every tier.
 *
 * In an up-to-date browser it only forwards events — CSS does the work.
 *
 * Placement: class `top` | `center` | `inline-end` | `inline-start` on the panel
 * (default: below, start-aligned). Gap: `data-popover-offset="8"` (px).
 * Events on the panel: `shown.lf.popover`, `hidden.lf.popover`.
 * Command events on the panel: `lf:popover:show`, `lf:popover:hide`,
 * `lf:popover:toggle`.
 */
import { Module } from '../core/Module.js';
import { onEscape } from '../core/global-events.js';
import { num } from '../core/attrs.js';
import { uid } from '../core/uid.js';

const DEFAULT_OFFSET = 6;

/**
 * Capability probes — read once per instance, exported for the docs page + tests.
 * `showPopover` rather than `'popover' in HTMLElement.prototype`: some engines
 * (and happy-dom) reflect the attribute without implementing the methods.
 */
export function popoverSupport() {
  const native =
    typeof HTMLElement !== 'undefined' &&
    typeof HTMLElement.prototype.showPopover === 'function';
  const anchor =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('position-area: block-end');
  return { native, anchor };
}

export class Popover extends Module {
  static id = 'popover';

  constructor(root = document) {
    super(root);

    this.support = popoverSupport();
    /** @type {Set<Element>} */
    this.open = new Set();

    if (!this.root.querySelector('[data-popover]')) return;
    this.mountAll('[data-popover]', (el) => this.#setup(el));

    // One shared listener repositions whatever is open, instead of one per panel.
    if (!this.support.anchor) {
      const reflow = () => this.open.forEach((el) => this.#place(el));
      this.on(window, 'scroll', reflow, { passive: true, capture: true });
      this.on(window, 'resize', reflow, { passive: true });
    }

    if (!this.support.native) {
      this.on(
        document,
        'click',
        (event) => {
          const trigger = event.target.closest('[popovertarget]');
          if (trigger) {
            const panel = document.getElementById(trigger.getAttribute('popovertarget'));
            if (panel?.hasAttribute('data-popover')) {
              event.preventDefault();
              this.toggle(panel, trigger);
              return;
            }
          }
          if (!event.target.closest('[data-popover].is-open')) this.hideAll();
        },
        true,
      );

      onEscape(this.signal, () => this.hideAll());
    }
  }

  #setup(el) {
    if (!el.id) el.id = uid('lf-popover');

    const trigger = Popover.#triggerFor(el);
    if (trigger && !trigger.hasAttribute('aria-expanded')) {
      trigger.setAttribute('aria-expanded', 'false');
    }

    if (!this.support.native) {
      el.setAttribute('data-popover-fallback', '');
      el.setAttribute('aria-hidden', 'true');
    } else {
      // Native popover reports its own state changes; mirror them.
      this.on(el, 'toggle', (event) => {
        const shown = event.newState === 'open';
        if (shown) {
          this.open.add(el);
          if (!this.support.anchor) this.#place(el);
        } else {
          this.open.delete(el);
          el.removeAttribute('data-popover-placed');
        }
        Popover.#triggerFor(el)?.setAttribute('aria-expanded', String(shown));
        this.emit(el, shown ? 'shown' : 'hidden', { native: true });
      });
    }

    this.commands(el, {
      show: () => this.show(el),
      hide: () => this.hide(el),
      toggle: () => this.toggle(el),
    });
  }

  static #triggerFor(el) {
    return document.querySelector(`[popovertarget="${el.id}"]`);
  }

  /** @param {Element} el @param {Element|null} [trigger] */
  show(el, trigger = null) {
    if (!el) return;

    if (this.support.native && typeof el.showPopover === 'function') {
      if (!el.matches(':popover-open')) el.showPopover();
      return;
    }

    this.hideAll();
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    this.open.add(el);
    this.#place(el, trigger);
    (trigger || Popover.#triggerFor(el))?.setAttribute('aria-expanded', 'true');
    this.emit(el, 'shown', { native: false });
  }

  /** @param {Element} el */
  hide(el) {
    if (!el) return;

    if (this.support.native && typeof el.hidePopover === 'function') {
      if (el.matches(':popover-open')) el.hidePopover();
      return;
    }

    if (!el.classList.contains('is-open')) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    el.removeAttribute('data-popover-placed');
    this.open.delete(el);
    Popover.#triggerFor(el)?.setAttribute('aria-expanded', 'false');
    this.emit(el, 'hidden', { native: false });
  }

  /** @param {Element} el @param {Element|null} [trigger] */
  toggle(el, trigger = null) {
    if (!el) return;
    const isOpen = this.support.native
      ? el.matches?.(':popover-open')
      : el.classList.contains('is-open');
    if (isOpen) this.hide(el);
    else this.show(el, trigger);
  }

  hideAll() {
    [...this.open].forEach((el) => this.hide(el));
  }

  /**
   * Place `el` next to its trigger with `position: fixed`.
   * Only runs when CSS anchor positioning is unavailable.
   */
  #place(el, trigger = null) {
    const anchor = trigger || Popover.#triggerFor(el);
    if (!anchor?.getBoundingClientRect) return;

    el.setAttribute('data-popover-placed', '');

    const gap = num(el, 'data-popover-offset', DEFAULT_OFFSET);
    const rect = anchor.getBoundingClientRect();
    const panel = el.getBoundingClientRect();
    const vw = window.innerWidth || 0;
    const vh = window.innerHeight || 0;

    let top;
    let left;

    if (el.classList.contains('inline-end')) {
      top = rect.top;
      left = rect.right + gap;
    } else if (el.classList.contains('inline-start')) {
      top = rect.top;
      left = rect.left - panel.width - gap;
    } else if (el.classList.contains('top')) {
      top = rect.top - panel.height - gap;
      left = el.classList.contains('center')
        ? rect.left + rect.width / 2 - panel.width / 2
        : rect.left;
    } else {
      top = rect.bottom + gap;
      left = el.classList.contains('center')
        ? rect.left + rect.width / 2 - panel.width / 2
        : rect.left;
    }

    // Flip / clamp so the panel stays on screen (what position-try does in CSS).
    if (top + panel.height > vh && rect.top - panel.height - gap > 0) {
      top = rect.top - panel.height - gap;
    }
    if (left + panel.width > vw) left = Math.max(gap, vw - panel.width - gap);
    if (left < gap) left = gap;

    el.style.top = `${Math.max(gap, Math.round(top))}px`;
    el.style.left = `${Math.round(left)}px`;
  }

  destroy() {
    this.hideAll();
    super.destroy();
  }
}
