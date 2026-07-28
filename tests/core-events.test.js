import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { eventName, commandName, emit, debounce } from '../js/core/events.js';

describe('events helpers', () => {
  it('builds the out / in event names from id + verb', () => {
    expect(eventName('changed', 'quantity')).toBe('changed.lf.quantity');
    expect(eventName('committed', 'quantity')).toBe('committed.lf.quantity');
    expect(commandName('quantity', 'set')).toBe('lf:quantity:set');
    expect(commandName('tag-input', 'add')).toBe('lf:tag-input:add');
  });

  it('emit bubbles and reports preventDefault for cancelable events', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    let seen = null;
    target.addEventListener('close.lf.dismiss', (event) => {
      seen = event.detail;
      event.preventDefault();
    });

    const ok = emit(target, 'close.lf.dismiss', { id: 1 }, { cancelable: true });
    expect(ok).toBe(false);
    expect(seen).toEqual({ id: 1 });
    target.remove();
  });

  describe('debounce', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('fires once on the trailing edge with the last args', () => {
      const fn = vi.fn();
      const wait = debounce(fn, 100);
      wait(1);
      wait(2);
      wait(3);
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(3);
    });

    it('cancel drops a pending call so destroy cannot fire against dead state', () => {
      const fn = vi.fn();
      const wait = debounce(fn, 100);
      wait('x');
      wait.cancel();
      vi.advanceTimersByTime(100);
      expect(fn).not.toHaveBeenCalled();
    });

    it('flush runs immediately with the last args', () => {
      const fn = vi.fn();
      const wait = debounce(fn, 500);
      wait('a');
      wait('b');
      wait.flush();
      expect(fn).toHaveBeenCalledWith('b');
      vi.advanceTimersByTime(500);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
