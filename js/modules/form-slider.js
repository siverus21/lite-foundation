/**
 * Lightweight range slider for .slider[data-slider] markup
 */
import { Module } from '../core/Module.js';

export class FormSlider extends Module {
  constructor(root = document) {
    super(root);
    this._controls = [];
    root.querySelectorAll('[data-slider]').forEach((el) => {
      this._controls.push(new FormSliderControl(el, this));
    });
  }

  destroy() {
    this._controls.forEach((c) => c.destroy?.());
    this._controls = [];
    super.destroy();
  }
}

class FormSliderControl {
  constructor(root, owner) {
    this.root = root;
    this.owner = owner;
    this.handle = root.querySelector('[data-slider-handle]');
    this.fill = root.querySelector('[data-slider-fill]');
    this.input = root.querySelector('input[type="hidden"]');
    if (!this.handle) return;

    this.min = Number(root.getAttribute('data-start') ?? 0);
    this.max = Number(root.getAttribute('data-end') ?? 100);
    this.value = this.#clamp(Number(root.getAttribute('data-initial-start') ?? this.min));
    this.vertical = root.classList.contains('vertical');
    this.dragging = false;

    this.handle.setAttribute('role', 'slider');
    this.handle.setAttribute('tabindex', this.handle.getAttribute('tabindex') || '0');
    if (this.vertical) this.handle.setAttribute('aria-orientation', 'vertical');
    this.#apply(this.value, false);
    this.#bind();
  }

  #clamp(value) {
    return Math.min(this.max, Math.max(this.min, value));
  }

  #apply(next, announce = true) {
    this.value = this.#clamp(next);
    const pct = ((this.value - this.min) / (this.max - this.min)) * 100;

    if (this.vertical) {
      this.handle.style.bottom = `${pct}%`;
      this.handle.style.top = 'auto';
      this.handle.style.left = '50%';
      this.handle.style.transform = 'translate(-50%, 50%)';
      if (this.fill) {
        this.fill.style.height = `${pct}%`;
        this.fill.style.width = '';
      }
    } else {
      this.handle.style.left = `${pct}%`;
      this.handle.style.top = '';
      this.handle.style.bottom = '';
      this.handle.style.transform = '';
      if (this.fill) {
        this.fill.style.width = `${pct}%`;
        this.fill.style.height = '';
      }
    }

    if (this.input) this.input.value = String(this.value);
    this.handle.setAttribute('aria-valuenow', String(this.value));
    this.handle.setAttribute('aria-valuemin', String(this.min));
    this.handle.setAttribute('aria-valuemax', String(this.max));
    if (announce) {
      this.root.dispatchEvent(
        new CustomEvent('changed.lf.slider', { detail: { value: this.value } }),
      );
    }
  }

  #valueFromPointer(clientX, clientY) {
    const rect = this.root.getBoundingClientRect();
    let ratio;
    if (this.vertical) {
      ratio = 1 - (clientY - rect.top) / rect.height;
    } else {
      ratio = (clientX - rect.left) / rect.width;
    }
    return this.min + this.#clampRatio(ratio) * (this.max - this.min);
  }

  #clampRatio(ratio) {
    return Math.min(1, Math.max(0, ratio));
  }

  #bind() {
    this.owner.on(this.root, 'pointerdown', (event) => this.#startDrag(event));
    this.owner.on(this.handle, 'keydown', (event) => this.#onKeydown(event));
  }

  #onMove = (event) => {
    if (!this.dragging) return;
    const point = event.touches ? event.touches[0] : event;
    this.#apply(this.#valueFromPointer(point.clientX, point.clientY));
  };

  #onUp = () => {
    if (!this.dragging) return;
    this.dragging = false;
    this.handle.classList.remove('is-dragging');
    this.fill?.classList.remove('is-dragging');
    window.removeEventListener('pointermove', this.#onMove);
    window.removeEventListener('pointerup', this.#onUp);
    window.removeEventListener('touchmove', this.#onMove);
    window.removeEventListener('touchend', this.#onUp);
  };

  #startDrag(event) {
    if (this.root.classList.contains('disabled') || this.root.hasAttribute('disabled')) return;
    event.preventDefault();
    this.dragging = true;
    this.handle.classList.add('is-dragging');
    this.fill?.classList.add('is-dragging');
    const point = event.touches ? event.touches[0] : event;
    this.#apply(this.#valueFromPointer(point.clientX, point.clientY));
    window.addEventListener('pointermove', this.#onMove);
    window.addEventListener('pointerup', this.#onUp);
    window.addEventListener('touchmove', this.#onMove, { passive: false });
    window.addEventListener('touchend', this.#onUp);
  }

  destroy() {
    this.#onUp();
  }

  #onKeydown(event) {
    const step = Number(this.root.getAttribute('data-step') ?? 1);
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.#apply(this.value + step);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.#apply(this.value - step);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.#apply(this.min);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.#apply(this.max);
    }
  }
}
