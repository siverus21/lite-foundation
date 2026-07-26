/**
 * Animate.css demo helpers (kitchen-sink only — enable scripts.animations).
 */
import { Module } from '../core/Module.js';

export class Animations extends Module {
  constructor(root = document) {
    super(root);
    this.box = root.getElementById?.('ks-animate-box') ?? document.getElementById('ks-animate-box');
    this.trigger =
      root.getElementById?.('ks-animate-trigger') ?? document.getElementById('ks-animate-trigger');
    if (!this.box || !this.trigger) return;

    this.visible = true;
    this.busy = false;

    this.box.style.overflow = 'hidden';
    this.box.style.transition =
      'height 0.3s ease, margin 0.3s ease, padding 0.3s ease, border-width 0.3s ease';

    this.pad = {
      top: getComputedStyle(this.box).paddingTop,
      bottom: getComputedStyle(this.box).paddingBottom,
      marginBottom: getComputedStyle(this.box).marginBottom,
    };

    this.on(this.trigger, 'click', () => this.#toggle());
  }

  #toggle() {
    if (this.busy) return;
    this.busy = true;
    this.box.classList.remove('animated', 'fadeIn', 'fadeOut');

    if (this.visible) this.#hide();
    else this.#show();
  }

  #hide() {
    const { box } = this;
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
        this.visible = false;
        this.busy = false;
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

  #show() {
    const { box, pad } = this;
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
        this.visible = true;
        this.busy = false;
      };
      box.addEventListener('animationend', onFadeIn);
      window.setTimeout(() => {
        if (!this.busy) return;
        box.classList.remove('animated', 'fadeIn');
        this.visible = true;
        this.busy = false;
      }, 1000);
    };

    const onExpand = (e) => {
      if (e.target !== box || e.propertyName !== 'height') return;
      box.removeEventListener('transitionend', onExpand);
      startFadeIn();
    };

    box.addEventListener('transitionend', onExpand);
    window.setTimeout(() => {
      if (this.visible || !this.busy) return;
      box.removeEventListener('transitionend', onExpand);
      startFadeIn();
    }, 350);
  }
}
