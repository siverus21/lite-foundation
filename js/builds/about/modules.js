
/**
 * Register and run enabled UI modules (see config/features.js builds).
 * GENERATED — do not edit by hand.
 */
export function initModules() {
  const modules = [

  ];

  modules.forEach((Module) => {
    try {
      new Module();
    } catch (error) {
      console.error('[lite-foundation] module init failed:', Module.name, error);
    }
  });
}
