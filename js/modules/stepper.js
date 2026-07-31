/**
 * Linear stepper / wizard progress indicator.
 *
 *   <ol class="stepper" data-stepper id="checkout">
 *     <li class="stepper-step is-active" data-stepper-step>Корзина</li>
 *     <li class="stepper-step" data-stepper-step>Доставка</li>
 *   </ol>
 *   <button type="button" data-stepper-prev>Назад</button>
 *   <button type="button" data-stepper-next>Далее</button>
 *
 * Steps before the active one get `is-complete`, the active one `is-active` plus
 * `aria-current="step"`. It is an indicator, not a router: you decide what each
 * step shows, the stepper only tracks where the visitor is.
 *
 * Settings (attributes on the root):
 *   data-clickable   clicking a step jumps to it (use only when steps are
 *                    reachable in any order — a paid order isn't)
 *
 * Nav buttons are looked up in the closest common ancestor, or scoped explicitly
 * with `data-stepper-for="<root id>"` when several steppers share a container.
 *
 * Event on the root: `changed.lf.stepper`, detail { index, previous, total }.
 * Commands on the root:
 *   lf:stepper:goto  { index }
 *   lf:stepper:next
 *   lf:stepper:prev
 * Instance API: goTo(el, index), next(el), prev(el), index(el).
 */
import { Module } from '../core/Module.js';
import { bool } from '../core/attrs.js';

export class Stepper extends Module {
  static id = 'stepper';
  static lazySelector = '[data-stepper]';

  constructor(root = document) {
    super(root);
    this.mountAll('[data-stepper]', (el) => this.#init(el));
  }

  #init(el) {
    this.#syncAriaCurrent(el);

    this.on(el, 'click', (event) => {
      if (!bool(el, 'data-clickable')) return;
      const step = event.target.closest('[data-stepper-step]');
      if (!step || step.parentElement !== el) return;
      const index = this.#steps(el).indexOf(step);
      if (index !== -1) this.goTo(el, index);
    });

    const container = el.parentElement || el;
    this.on(container, 'click', (event) => {
      const button = event.target.closest('[data-stepper-next], [data-stepper-prev]');
      if (!button) return;
      // Two steppers under one parent must not both react to one button.
      const scope = button.getAttribute('data-stepper-for');
      if (scope && scope !== el.id) return;
      if (!scope && this.#closestStepper(button) !== el) return;

      if (button.hasAttribute('data-stepper-next')) this.next(el);
      else this.prev(el);
    });

    this.commands(el, {
      goto: (event) => {
        const { index } = event.detail || {};
        if (typeof index === 'number') this.goTo(el, index);
      },
      next: () => this.next(el),
      prev: () => this.prev(el),
    });
  }

  /** Nearest stepper root that shares an ancestor with `button`. */
  #closestStepper(button) {
    let scope = button.parentElement;
    while (scope) {
      const found = scope.querySelector('[data-stepper]');
      if (found) return found;
      scope = scope.parentElement;
    }
    return null;
  }

  #steps(el) {
    return [...el.querySelectorAll(':scope > [data-stepper-step]')];
  }

  #syncAriaCurrent(el) {
    this.#steps(el).forEach((step) => {
      if (step.classList.contains('is-active')) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  }

  /** @param {Element} el @returns {number} -1 when no step is active */
  index(el) {
    return this.#steps(el).findIndex((step) => step.classList.contains('is-active'));
  }

  /** @param {Element} el @param {number} index */
  goTo(el, index) {
    const steps = this.#steps(el);
    if (index < 0 || index >= steps.length) return;
    const previous = this.index(el);

    steps.forEach((step, i) => {
      step.classList.remove('is-active', 'is-complete');
      step.removeAttribute('aria-current');
      if (i < index) {
        step.classList.add('is-complete');
      } else if (i === index) {
        step.classList.add('is-active');
        step.setAttribute('aria-current', 'step');
      }
    });

    this.emit(el, 'changed', { index, previous, total: steps.length });
  }

  /** @param {Element} el */
  next(el) {
    const total = this.#steps(el).length;
    this.goTo(el, Math.min(total - 1, this.index(el) + 1));
  }

  /** @param {Element} el */
  prev(el) {
    this.goTo(el, Math.max(0, this.index(el) - 1));
  }
}
