import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FormSlider } from '../js/modules/form-slider.js';

describe('FormSlider', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="slider" data-slider data-initial-start="40" data-end="100" data-start="0" data-step="10">
        <span class="slider-handle" data-slider-handle></span>
        <span class="slider-fill" data-slider-fill></span>
        <input type="hidden">
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('initializes aria values and fill from data-initial-start', () => {
    const fs = new FormSlider(document);
    const handle = document.querySelector('[data-slider-handle]');
    const fill = document.querySelector('[data-slider-fill]');
    const input = document.querySelector('input[type="hidden"]');

    expect(handle.getAttribute('role')).toBe('slider');
    expect(handle.getAttribute('aria-valuenow')).toBe('40');
    expect(handle.getAttribute('aria-valuemin')).toBe('0');
    expect(handle.getAttribute('aria-valuemax')).toBe('100');
    expect(input.value).toBe('40');
    // Position is a custom property on the root; CSS applies it to fill + handle.
    expect(document.querySelector('.slider').style.getPropertyValue('--lf-slider-percent')).toBe(
      '40%',
    );
    expect(fill).toBeTruthy();
    fs.destroy();
  });

  it('snaps dragged values to data-step', () => {
    const fs = new FormSlider(document);
    const el = document.querySelector('.slider');
    const input = document.querySelector('input[type="hidden"]');
    el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 10 });

    // 47% of 0…100 → 47, which must land on the step=10 grid instead of in the
    // submitted field as-is.
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: 94, clientY: 5, bubbles: true }));

    expect(input.value).toBe('50');
    expect(Number.isInteger(Number(input.value))).toBe(true);
    fs.destroy();
  });

  it('moves value with arrow keys by data-step', () => {
    const fs = new FormSlider(document);
    const handle = document.querySelector('[data-slider-handle]');

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(handle.getAttribute('aria-valuenow')).toBe('50');

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(handle.getAttribute('aria-valuenow')).toBe('0');

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(handle.getAttribute('aria-valuenow')).toBe('100');
    fs.destroy();
  });

  it('sets aria-orientation for vertical sliders', () => {
    document.body.innerHTML = `
      <div class="slider vertical" data-slider data-initial-start="10">
        <span class="slider-handle" data-slider-handle></span>
        <span class="slider-fill" data-slider-fill></span>
      </div>
    `;
    const fs = new FormSlider(document);
    expect(document.querySelector('[data-slider-handle]').getAttribute('aria-orientation')).toBe(
      'vertical',
    );
    fs.destroy();
  });

  it('emits changed.lf.form-slider and answers lf:form-slider:set', () => {
    const fs = new FormSlider(document);
    const el = document.querySelector('.slider');
    const seen = [];
    el.addEventListener('changed.lf.form-slider', (event) => seen.push(event.detail.value));

    el.dispatchEvent(new CustomEvent('lf:form-slider:set', { detail: { value: 70 } }));

    expect(seen).toEqual([70]);
    expect(el.querySelector('input').value).toBe('70');
    expect(el.hasAttribute('data-form-slider-ready')).toBe(true);
    fs.destroy();
  });
});
