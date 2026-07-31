import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Animations } from '../js/modules/animations.js';

describe('Animations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <div id="demo-box" class="callout" style="padding: 8px; margin-bottom: 8px;" data-lf-animate>Box</div>
      <button type="button" data-lf-animate-trigger="demo-box">Toggle</button>
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

  it('starts hide animation on trigger click via data-lf-animate', async () => {
    const anim = new Animations(document);
    const box = document.getElementById('demo-box');
    document.querySelector('[data-lf-animate-trigger]').click();

    expect(box.classList.contains('fadeOut') || box.classList.contains('animated')).toBe(true);
    await vi.runAllTimersAsync();
    anim.destroy();
  });

  it('still supports legacy ks-animate-* ids', async () => {
    document.body.innerHTML = `
      <div id="ks-animate-box" class="callout" style="padding: 8px;">Box</div>
      <button type="button" id="ks-animate-trigger">Toggle</button>
    `;
    const anim = new Animations(document);
    document.getElementById('ks-animate-trigger').click();
    expect(document.getElementById('ks-animate-box').classList.contains('fadeOut')).toBe(true);
    await vi.runAllTimersAsync();
    anim.destroy();
  });

  it('ignores clicks while an animation is busy (aria-busy)', () => {
    const anim = new Animations(document);
    const trigger = document.querySelector('[data-lf-animate-trigger]');
    const box = document.getElementById('demo-box');

    trigger.click();
    expect(box.getAttribute('aria-busy')).toBe('true');
    const classes = box.className;
    trigger.click();
    expect(box.className).toBe(classes);
    expect(box.classList.contains('fadeIn')).toBe(false);

    anim.destroy();
  });
});

