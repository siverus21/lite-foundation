import { describe, it, expect, vi } from 'vitest';
import { Module } from '../js/core/Module.js';

describe('Module', () => {
  it('binds listeners and removes them on destroy', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    const mod = new Module(root);
    const spy = vi.fn();

    mod.on(root, 'click', spy);
    root.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(spy).toHaveBeenCalledTimes(1);

    mod.destroy();
    root.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(spy).toHaveBeenCalledTimes(1);

    root.remove();
  });
});
