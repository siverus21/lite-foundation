/**
 * Animate.css show/hide helper.
 *
 *   <div data-lf-animate id="hero-box">…</div>
 *   <button type="button" data-lf-animate-trigger="hero-box">Toggle</button>
 *
 * While a transition runs, the box gets `aria-busy="true"` (public signal —
 * second clicks are ignored until it clears).
 *
 * Kitchen-sink still works via legacy ids `ks-animate-box` / `ks-animate-trigger`
 * when the data attributes are absent.
 */
import { Module } from '../core/Module.js';

export class Animations extends Module {
  static id = 'animations';
  static lazySelector = '[data-lf-animate], #ks-animate-box, [data-lf-animate-trigger]';

  constructor(root = document) {
    super(root);
    /** @type {{ box: HTMLElement, trigger: Element, visible: boolean, busy: boolean, pad: object }[]} */
    this._pairs = [];

    this.mountAll('[data-lf-animate]', (box) => {
      if (!(box instanceof HTMLElement)) return;
      const trigger = this.#triggerFor(box);
      if (trigger) this.#bindPair(box, trigger);
    });

    // Legacy kitchen-sink ids (single pair).
    if (!this._pairs.length) {
      const box =
        root.getElementById?.('ks-animate-box') ?? document.getElementById('ks-animate-box');
      const trigger =
        root.getElementById?.('ks-animate-trigger') ??
        document.getElementById('ks-animate-trigger');
      if (box instanceof HTMLElement && trigger) this.#bindPair(box, trigger);
    }
  }

  /** @param {HTMLElement} box */
  #triggerFor(box) {
    const id = box.id;
    if (id) {
      const byFor =
        this.root.querySelector?.(`[data-lf-animate-trigger="${id}"]`) ||
        document.querySelector(`[data-lf-animate-trigger="${id}"]`);
      if (byFor) return byFor;
    }
    return (
      box.querySelector(':scope > [data-lf-animate-trigger], :scope [data-lf-animate-trigger]') ||
      null
    );
  }

  /** @param {HTMLElement} box @param {Element} trigger */
  #bindPair(box, trigger) {
    const pair = {
      box,
      trigger,
      visible: true,
      busy: false,
      pad: {
        top: getComputedStyle(box).paddingTop,
        bottom: getComputedStyle(box).paddingBottom,
        marginBottom: getComputedStyle(box).marginBottom,
      },
    };

    box.style.overflow = 'hidden';
    box.style.transition =
      'height 0.3s ease, margin 0.3s ease, padding 0.3s ease, border-width 0.3s ease';

    this.on(trigger, 'click', () => this.#toggle(pair));
    this._pairs.push(pair);
  }

  /**
   * @param {{ box: HTMLElement, busy: boolean }} pair
   * @param {boolean} busy
   */
  #setBusy(pair, busy) {
    pair.busy = busy;
    if (busy) pair.box.setAttribute('aria-busy', 'true');
    else pair.box.removeAttribute('aria-busy');
  }

  /** @param {{ box: HTMLElement, visible: boolean, busy: boolean, pad: object }} pair */
  #toggle(pair) {
    if (pair.busy) return;
    this.#setBusy(pair, true);
    pair.box.classList.remove('animated', 'fadeIn', 'fadeOut');

    if (pair.visible) this.#hide(pair);
    else this.#show(pair);
  }

  /** @param {{ box: HTMLElement, visible: boolean, busy: boolean }} pair */
  #hide(pair) {
    const { box } = pair;
    box.style.height = `${box.offsetHeight}px`;
    void box.offsetHeight;
    box.classList.add('animated', 'fadeOut');

    const onFadeOut = (event) => {
      if (event.target !== box) return;
      box.removeEventListener('animationend', onFadeOut);
      box.classList.remove('animated', 'fadeOut');
      box.style.opacity = '0';
      box.style.paddingTop = '0';
      box.style.paddingBottom = '0';
      box.style.marginBottom = '0';
      box.style.borderWidth = '0';
      box.style.height = '0';

      const finish = () => {
        pair.visible = false;
        this.#setBusy(pair, false);
      };

      const onCollapse = (e) => {
        if (e.target !== box || e.propertyName !== 'height') return;
        box.removeEventListener('transitionend', onCollapse);
        finish();
      };
      box.addEventListener('transitionend', onCollapse);
      window.setTimeout(finish, 350);
    };

    box.addEventListener('animationend', onFadeOut);
  }

  /** @param {{ box: HTMLElement, visible: boolean, busy: boolean, pad: object }} pair */
  #show(pair) {
    const { box, pad } = pair;
    box.style.opacity = '0';
    box.style.borderWidth = '';
    box.style.paddingTop = pad.top;
    box.style.paddingBottom = pad.bottom;
    box.style.marginBottom = pad.marginBottom;
    box.style.height = 'auto';
    const target = box.offsetHeight;
    box.style.height = '0';
    void box.offsetHeight;
    box.style.height = `${target}px`;

    const startFadeIn = () => {
      box.style.height = 'auto';
      box.style.opacity = '';
      box.classList.add('animated', 'fadeIn');

      const onFadeIn = (event) => {
        if (event.target !== box) return;
        box.removeEventListener('animationend', onFadeIn);
        box.classList.remove('animated', 'fadeIn');
        pair.visible = true;
        this.#setBusy(pair, false);
      };
      box.addEventListener('animationend', onFadeIn);
      window.setTimeout(() => {
        if (!pair.busy) return;
        box.classList.remove('animated', 'fadeIn');
        pair.visible = true;
        this.#setBusy(pair, false);
      }, 1000);
    };

    const onExpand = (e) => {
      if (e.target !== box || e.propertyName !== 'height') return;
      box.removeEventListener('transitionend', onExpand);
      startFadeIn();
    };

    box.addEventListener('transitionend', onExpand);
    window.setTimeout(() => {
      if (pair.visible || !pair.busy) return;
      box.removeEventListener('transitionend', onExpand);
      startFadeIn();
    }, 350);
  }
}
