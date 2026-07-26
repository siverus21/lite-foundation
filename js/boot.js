/**
 * Shared boot for named builds (js/builds/{name}/entry.js).
 *
 * Dev: keep dist/*.css render-blocking for first paint; optionally import Sass
 * for HMR only — never disable the link (that caused FOUC / missing borders).
 * Prod: wait for the stylesheet, then init modules.
 */
export function boot(options) {
  const initModules = options.initModules;
  const loadDevScss = options.loadDevScss;
  const cssHrefEndsWith = options.cssHrefEndsWith || 'app.css';

  async function run() {
    if (import.meta.env.DEV) {
      // Fire-and-forget HMR pipeline; dist CSS already paints the page.
      if (typeof loadDevScss === 'function') {
        loadDevScss().catch((err) => {
          console.warn('[lite-foundation] dev Sass HMR failed', err);
        });
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
