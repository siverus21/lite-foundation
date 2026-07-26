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
 * @param {Array<new (root?: ParentNode) => { destroy?: () => void }>} ModuleClasses
 */
export function createModuleRuntime(ModuleClasses) {
  function init(root = document) {
    const reg = registryFor(root);
    for (const Module of ModuleClasses) {
      if (reg.has(Module)) continue;
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
