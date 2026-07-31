import { describe, it, expect, afterEach, vi } from 'vitest';
import { afterTransition, animateHeight, prefersReducedMotion } from '../js/core/transition.js';

describe('prefersReducedMotion / afterTransition / animateHeight', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('prefersReducedMotion reads matchMedia', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    expect(prefersReducedMotion()).toBe(true);
  });

  it('afterTransition finishes immediately under reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: () => {},
      removeEventListener: () => {},
    });
    const el = document.createElement('div');
    const done = vi.fn();
    afterTransition(el, done, { fallback: 5000 });
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('animateHeight resolves immediately and sets final height under reduced motion', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: () => {},
      removeEventListener: () => {},
    });
    const el = document.createElement('div');
    document.body.appendChild(el);

    await animateHeight(el, 'open');
    expect(el.style.height).toBe('auto');

    await animateHeight(el, 'close');
    expect(el.style.height).toBe('0px');
  });

  it('afterTransition uses the fallback timer when motion is allowed', async () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: () => {},
      removeEventListener: () => {},
    });
    const el = document.createElement('div');
    const done = vi.fn();
    afterTransition(el, done, { property: 'height', fallback: 200 });
    expect(done).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(200);
    expect(done).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
