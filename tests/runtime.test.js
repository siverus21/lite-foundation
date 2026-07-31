import { describe, it, expect, vi } from 'vitest';
import { createModuleRuntime, createLF } from '../js/core/runtime.js';
import { Module } from '../js/core/Module.js';

class Probe extends Module {
  static instances = 0;
  constructor(root) {
    super(root);
    Probe.instances += 1;
  }
  destroy() {
    Probe.instances -= 1;
    super.destroy();
  }
}

describe('createModuleRuntime', () => {
  it('init is idempotent for the same root', () => {
    Probe.instances = 0;
    const root = document.createElement('div');
    const runtime = createModuleRuntime([Probe]);

    runtime.init(root);
    runtime.init(root);
    expect(Probe.instances).toBe(1);

    runtime.destroy(root);
    expect(Probe.instances).toBe(0);
  });

  it('refresh destroys then reinits', () => {
    Probe.instances = 0;
    const root = document.createElement('div');
    const runtime = createModuleRuntime([Probe]);

    runtime.init(root);
    const first = Probe.instances;
    runtime.refresh(root);
    expect(first).toBe(1);
    expect(Probe.instances).toBe(1);

    runtime.destroy(root);
  });

  it('isolates registries per root', () => {
    Probe.instances = 0;
    const a = document.createElement('div');
    const b = document.createElement('div');
    const runtime = createModuleRuntime([Probe]);

    runtime.init(a);
    runtime.init(b);
    expect(Probe.instances).toBe(2);

    runtime.destroy(a);
    expect(Probe.instances).toBe(1);
    runtime.destroy(b);
    expect(Probe.instances).toBe(0);
  });

  it('unmount destroys and clears element children', () => {
    Probe.instances = 0;
    const root = document.createElement('div');
    root.innerHTML = '<p data-probe>hi</p>';
    const runtime = createModuleRuntime([Probe]);

    runtime.init(root);
    expect(Probe.instances).toBe(1);
    expect(root.children.length).toBe(1);

    runtime.unmount(root);
    expect(Probe.instances).toBe(0);
    expect(root.children.length).toBe(0);
    expect(root.isConnected || true).toBe(true);
  });

  it('unmount with removeRoot removes the element', () => {
    Probe.instances = 0;
    const host = document.createElement('div');
    const root = document.createElement('div');
    host.appendChild(root);
    document.body.appendChild(host);

    const runtime = createModuleRuntime([Probe]);
    runtime.init(root);
    runtime.unmount(root, { removeRoot: true });

    expect(Probe.instances).toBe(0);
    expect(host.contains(root)).toBe(false);
    host.remove();
  });

  it('unmount refuses to wipe document/body', () => {
    Probe.instances = 0;
    const runtime = createModuleRuntime([Probe]);
    runtime.init(document);
    expect(Probe.instances).toBe(1);

    const before = document.body.childNodes.length;
    runtime.unmount(document);
    expect(Probe.instances).toBe(0);
    expect(document.body.childNodes.length).toBe(before);
  });

  it('swallows constructor errors and continues', () => {
    class Boom {
      constructor() {
        throw new Error('fail');
      }
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const runtime = createModuleRuntime([Boom, Probe]);
    Probe.instances = 0;
    const root = document.createElement('div');
    runtime.init(root);
    expect(Probe.instances).toBe(1);
    spy.mockRestore();
    runtime.destroy(root);
  });

  it('skips modules whose lazySelector matches nothing in the root', () => {
    class LazyOnly extends Module {
      static lazySelector = '[data-lazy-probe]';
      static instances = 0;
      constructor(root) {
        super(root);
        LazyOnly.instances += 1;
      }
      destroy() {
        LazyOnly.instances -= 1;
        super.destroy();
      }
    }

    LazyOnly.instances = 0;
    Probe.instances = 0;
    const root = document.createElement('div');
    const runtime = createModuleRuntime([LazyOnly, Probe]);
    runtime.init(root);
    expect(LazyOnly.instances).toBe(0);
    expect(Probe.instances).toBe(1);

    root.innerHTML = '<div data-lazy-probe></div>';
    runtime.destroy(root);
    runtime.init(root);
    expect(LazyOnly.instances).toBe(1);

    runtime.destroy(root);
  });
});

describe('createLF', () => {
  it('inits modules on a root and exposes destroy/refresh', () => {
    Probe.instances = 0;
    const root = document.createElement('div');
    const lf = createLF([Probe], root);
    expect(Probe.instances).toBe(1);
    expect(lf.root).toBe(root);

    lf.refresh();
    expect(Probe.instances).toBe(1);

    lf.destroy();
    expect(Probe.instances).toBe(0);
  });
});
