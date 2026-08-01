/**
 * Docs entry loader — one HTML shell, many pages.
 *
 * URL `/docs/button.html` is rewritten by the Vite plugin to `docs/index.html`,
 * but `location.pathname` stays `/docs/button.html`, so we load
 * `./entries/button.jsx`. Add a page = add `entries/<slug>.jsx` (+ page/nav);
 * no new HTML file.
 */

const pages = import.meta.glob('./entries/*.jsx');

function slugFromLocation() {
  const seg = location.pathname.replace(/\/+$/, '').split('/').pop() || 'index.html';
  const base = seg.replace(/\.html$/i, '');
  return base || 'index';
}

const slug = slugFromLocation();
const key = `./entries/${slug}.jsx`;
const load = pages[key];

if (!load) {
  const root = document.getElementById('app');
  const known = Object.keys(pages)
    .map((p) => p.replace('./entries/', '').replace(/\.jsx$/, ''))
    .sort()
    .join(', ');
  if (root) {
    root.innerHTML = `
      <main class="docs-main" style="padding:2rem">
        <h1>Страница не найдена</h1>
        <p class="docs-lead">Нет entry для <code>${slug}</code>.</p>
        <p class="docs-meta">Ожидается <code>docs/src/entries/${slug}.jsx</code>.</p>
        <p class="docs-aside">Известные: ${known}</p>
        <p><a href="index.html">← Обзор</a></p>
      </main>
    `;
  }
  throw new Error(`docs: unknown page "${slug}" (no ${key})`);
}

await load();
