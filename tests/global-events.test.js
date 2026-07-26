import { describe, it, expect, afterEach } from 'vitest';
import { onEscape, resetGlobalEvents } from '../js/core/global-events.js';

describe('onEscape', () => {
  afterEach(() => {
    resetGlobalEvents();
  });

  it('fans a single Escape keydown out to every registered handler', () => {
    const controller = new AbortController();
    const a = [];
    const b = [];
    onEscape(controller.signal, () => a.push(1));
    onEscape(controller.signal, () => b.push(1));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(a).toEqual([1]);
    expect(b).toEqual([1]);

    controller.abort();
  });

  it('ignores non-Escape keys', () => {
    const controller = new AbortController();
    const calls = [];
    onEscape(controller.signal, () => calls.push(1));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(calls).toEqual([]);

    controller.abort();
  });

  it('stops calling a handler once its signal aborts', () => {
    const controller = new AbortController();
    const calls = [];
    onEscape(controller.signal, () => calls.push(1));
    controller.abort();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(calls).toEqual([]);
  });
});
