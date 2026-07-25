import './vendors.js';
import { initModules } from './modules/index.js';

async function boot() {
  if (import.meta.env.DEV) {
    document.querySelectorAll('link[href$="app.css"]').forEach((link) => {
      link.disabled = true;
    });
    await import('../scss/app.scss');
  } else {
    await waitForStylesheet(document.querySelector('link[href$="app.css"]'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initModules(), { once: true });
  } else {
    initModules();
  }
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

boot();
