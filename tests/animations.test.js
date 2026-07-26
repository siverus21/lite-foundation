import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Animations } from '../js/modules/animations.js';

describe('Animations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <div id="ks-animate-box" class="callout" style="padding: 8px; margin-bottom: 8px;">Box</div>
      <button type="button" id="ks-animate-trigger">Toggle</button>
    `;
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('no-ops when demo nodes are missing', () => {
    document.body.innerHTML = '';
    expect(() => new Animations(document).destroy()).not.toThrow();
  });

  it('starts hide animation on trigger click', async () => {
    const anim = new Animations(document);
    const box = document.getElementById('ks-animate-box');
    document.getElementById('ks-animate-trigger').click();

    expect(box.classList.contains('fadeOut') || box.classList.contains('animated')).toBe(true);
    await vi.runAllTimersAsync();
    anim.destroy();
  });
});
