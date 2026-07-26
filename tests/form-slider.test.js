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
    expect(fill.style.width).toBe('40%');
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
});
