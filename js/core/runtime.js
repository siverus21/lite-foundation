/**
 * Shared module runtime: init / destroy / refresh / unmount with instance registry.
 */

const registries = new WeakMap();

function registryFor(root) {
  let map = registries.get(root);
  if (!map) {
    map = new Map();
    registries.set(root, map);
  }
  return map;
}

function isSafeDomRoot(root) {
  return (
    root instanceof Element &&
    root !== document.documentElement &&
    root !== document.body
  );
}

/**
 * Skip constructing a module when it declares `static lazySelector` and the
 * root has no matches — avoids binding listeners for unused widgets.
 * @param {Function} Module
 * @param {ParentNode} root
 */
function shouldInitModule(Module, root) {
  const selector = Module?.lazySelector;
  if (!selector || typeof root?.querySelector !== 'function') return true;
  try {
    return Boolean(root.querySelector(selector));
  } catch {
    return true;
  }
}

/**
 * @param {Array<new (root?: ParentNode) => { destroy?: () => void }>} ModuleClasses
 */
export function createModuleRuntime(ModuleClasses) {
  function init(root = document) {
    const reg = registryFor(root);
    for (const Module of ModuleClasses) {
      if (reg.has(Module)) continue;
      if (!shouldInitModule(Module, root)) continue;
      try {
        const instance = new Module(root);
        reg.set(Module, instance);
      } catch (error) {
        console.error('[lite-foundation] module init failed:', Module.name, error);
      }
    }
    return reg;
  }

  function destroy(root = document) {
    const reg = registries.get(root);
    if (!reg) return;
    for (const [, instance] of reg) {
      try {
        instance?.destroy?.();
      } catch (error) {
        console.error('[lite-foundation] module destroy failed:', error);
      }
    }
    reg.clear();
    registries.delete(root);
  }

  function refresh(root = document) {
    destroy(root);
    return init(root);
  }

  /**
   * Destroy JS instances, then remove markup.
   * @param {ParentNode} [root=document]
   * @param {{ removeRoot?: boolean }} [options]
   *   - default: clear children (`replaceChildren`), keep the container
   *   - `removeRoot: true`: remove the element itself (ignored for document/body/html)
   */
  function unmount(root = document, options = {}) {
    destroy(root);
    if (!isSafeDomRoot(root)) return;

    if (options.removeRoot) {
      root.remove();
      return;
    }

    root.replaceChildren();
  }

  return { init, destroy, refresh, unmount };
}

/**
 * Thin multi-instance wrapper: create a runtime bound to one root.
 *
 *   import { Accordion, Tabs } from '…';
 *   import { createLF } from '/js/core/runtime.js';
 *   const lf = createLF([Accordion, Tabs], panel);
 *   // later: lf.destroy();
 *
 * @param {Array<new (root?: ParentNode) => { destroy?: () => void }>} ModuleClasses
 * @param {ParentNode} [root=document]
 */
export function createLF(ModuleClasses, root = document) {
  const runtime = createModuleRuntime(ModuleClasses);
  runtime.init(root);
  return {
    root,
    init: () => runtime.init(root),
    destroy: () => runtime.destroy(root),
    refresh: () => runtime.refresh(root),
    unmount: (options) => runtime.unmount(root, options),
  };
}
