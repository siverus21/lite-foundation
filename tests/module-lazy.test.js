import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Module } from '../js/core/Module.js';

describe('Module.mount data-lf-lazy', () => {
  let observe;
  let trigger;

  beforeEach(() => {
    observe = vi.fn();
    trigger = null;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb) {
          trigger = cb;
        }
        observe = observe;
        disconnect = vi.fn();
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('runs setup immediately without data-lf-lazy', () => {
    const el = document.createElement('div');
    document.body.append(el);
    const setup = vi.fn();
    const mod = new Module(document);
    mod.mount(el, setup);
    expect(setup).toHaveBeenCalledWith(el);
    expect(observe).not.toHaveBeenCalled();
    mod.destroy();
    el.remove();
  });

  it('defers setup until intersect when data-lf-lazy is set', () => {
    const el = document.createElement('div');
    el.setAttribute('data-lf-lazy', '');
    document.body.append(el);
    const setup = vi.fn();
    const mod = new Module(document);
    mod.mount(el, setup);
    expect(setup).not.toHaveBeenCalled();
    expect(observe).toHaveBeenCalledWith(el);
    trigger([{ isIntersecting: true, target: el }]);
    expect(setup).toHaveBeenCalledWith(el);
    mod.destroy();
    el.remove();
  });

  it('runs setup eagerly when data-lf-lazy is set but the element has no box (display:none)', () => {
    // Real-world case: data-lf-lazy on a <dialog>/.offcanvas root, or on anything
    // inside a hidden tab/accordion panel — IntersectionObserver would never fire,
    // so lazy-loading it would permanently skip setup.
    const el = document.createElement('div');
    el.setAttribute('data-lf-lazy', '');
    el.getClientRects = () => [];
    document.body.append(el);
    const setup = vi.fn();
    const mod = new Module(document);
    mod.mount(el, setup);
    expect(setup).toHaveBeenCalledWith(el);
    expect(observe).not.toHaveBeenCalled();
    mod.destroy();
    el.remove();
  });
});
