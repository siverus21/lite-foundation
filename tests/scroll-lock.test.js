import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { lockScroll, unlockScroll, resetScrollLock } from '../js/core/scroll-lock.js';

describe('scroll-lock', () => {
  beforeEach(() => {
    resetScrollLock();
    window.scrollTo(0, 120);
  });

  afterEach(() => {
    resetScrollLock();
  });

  it('locks body on first lockScroll', () => {
    lockScroll();
    expect(document.body.classList.contains('is-scroll-locked')).toBe(true);
    expect(document.body.dataset.lfScrollY).toBe('120');
    expect(document.body.style.top).toBe('-120px');
  });

  it('restores scroll without smooth behavior on unlock', () => {
    document.documentElement.style.scrollBehavior = 'smooth';
    const spy = vi.spyOn(window, 'scrollTo');
    lockScroll();
    unlockScroll();
    expect(document.documentElement.style.scrollBehavior).toBe('auto');
    expect(spy).toHaveBeenCalled();
    const [arg0, arg1] = spy.mock.calls[0];
    if (typeof arg0 === 'number') {
      expect(arg0).toBe(0);
      expect(arg1).toBe(120);
    } else {
      expect(arg0).toMatchObject({ top: 120 });
    }
    spy.mockRestore();
    document.documentElement.style.scrollBehavior = '';
  });

  it('keeps lock until matching unlocks', () => {
    lockScroll();
    lockScroll();
    unlockScroll();
    expect(document.body.classList.contains('is-scroll-locked')).toBe(true);
    unlockScroll();
    expect(document.body.classList.contains('is-scroll-locked')).toBe(false);
  });
});
