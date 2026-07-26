/**
 * Shared boot for named builds (js/builds/{name}/entry.js).
 */
export function boot(options) {
  const initModules = options.initModules;
  const loadDevScss = options.loadDevScss;
  const cssHrefEndsWith = options.cssHrefEndsWith || 'app.css';

  async function run() {
    if (import.meta.env.DEV) {
      document.querySelectorAll(`link[href$="${cssHrefEndsWith}"]`).forEach((link) => {
        link.disabled = true;
      });
      if (typeof loadDevScss === 'function') {
        await loadDevScss();
      }
    } else {
      await waitForStylesheet(document.querySelector(`link[href$="${cssHrefEndsWith}"]`));
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initModules(), { once: true });
    } else {
      initModules();
    }
  }

  run();
}

function waitForStylesheet(link) {
  if (!link || link.sheet) return Promise.resolve();

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };

    link.addEventListener('load', finish, { once: true });
    link.addEventListener('error', finish, { once: true });

    const poll = () => {
      if (link.sheet) finish();
      else if (!done) requestAnimationFrame(poll);
    };
    poll();
    window.setTimeout(finish, 2000);
  });
}
