/**
 * Docs chrome: sidebar between pages, in-page TOC, prev/next pager, copy buttons,
 * browser-support block (data in assets/support-data.js).
 *
 * JSX pages under docs/src/ ship their own chrome via DocsPage — skip this file there.
 */
import { FEATURES, PAGE_FEATURES, STATUS_LABELS } from './support-data.js';
import { FLAT, NAV, TOP_NAV } from '../src/nav.js';

function currentFile() {
  return location.pathname.split('/').pop() || 'index.html';
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

function ensureIds(main) {
  const used = new Set();
  main.querySelectorAll('.docs-section > h2').forEach((h2) => {
    if (!h2.id) {
      let id = slugify(h2.textContent || 'section');
      let n = 2;
      while (used.has(id) || document.getElementById(id)) {
        id = `${slugify(h2.textContent || 'section')}-${n}`;
        n += 1;
      }
      h2.id = id;
    }
    used.add(h2.id);
  });
}

/**
 * Sidebar is `position: sticky`, so nesting the current page's section anchors
 * under its active link gives a jump-menu that stays on screen while scrolling
 * long pages (e.g. ui-kit.html) — unlike the in-flow `.docs-toc` above `<main>`.
 */
function buildSidebar(file, headings) {
  const aside = document.createElement('aside');
  aside.className = 'docs-sidebar';
  aside.setAttribute('aria-label', 'Навигация по документации');

  const brand = document.createElement('a');
  brand.className = 'docs-sidebar-brand';
  brand.href = 'index.html';
  brand.textContent = 'lite-foundation';
  aside.appendChild(brand);

  NAV.forEach((group) => {
    const label = document.createElement('p');
    label.className = 'docs-sidebar-group';
    label.textContent = group.group;
    aside.appendChild(label);

    const list = document.createElement('ul');
    list.className = 'docs-sidebar-list';
    group.items.forEach((item) => {
      const isActive = item.href === file;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.title;
      if (isActive) a.classList.add('is-active');
      a.setAttribute('aria-current', isActive ? 'page' : 'false');
      li.appendChild(a);

      if (isActive && headings && headings.length) {
        const sub = document.createElement('ul');
        sub.className = 'docs-sidebar-toc';
        headings.forEach((h2) => {
          const subLi = document.createElement('li');
          const subA = document.createElement('a');
          subA.href = `#${h2.id}`;
          subA.textContent = h2.textContent;
          subLi.appendChild(subA);
          sub.appendChild(subLi);
        });
        li.appendChild(sub);
      }

      list.appendChild(li);
    });
    aside.appendChild(list);
  });

  const sink = document.createElement('a');
  sink.className = 'docs-sidebar-extra';
  sink.href = '../index.html';
  sink.textContent = 'Kitchen sink →';
  aside.appendChild(sink);

  return aside;
}

function buildToc(main) {
  const headings = [...main.querySelectorAll('.docs-section > h2')];
  if (headings.length < 2) return null;

  const nav = document.createElement('nav');
  nav.className = 'docs-toc';
  nav.setAttribute('aria-label', 'На этой странице');

  const title = document.createElement('p');
  title.className = 'docs-toc-title';
  title.textContent = 'На этой странице';
  nav.appendChild(title);

  const list = document.createElement('ul');
  list.className = 'docs-toc-list';
  headings.forEach((h2) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${h2.id}`;
    a.textContent = h2.textContent;
    li.appendChild(a);
    list.appendChild(li);
  });
  nav.appendChild(list);
  return nav;
}

function buildPager(file) {
  const index = FLAT.findIndex((p) => p.href === file);
  if (index < 0) return null;

  const prev = FLAT[index - 1];
  const next = FLAT[index + 1];
  if (!prev && !next) return null;

  const nav = document.createElement('nav');
  nav.className = 'docs-pager';
  nav.setAttribute('aria-label', 'Соседние разделы');

  if (prev) {
    const a = document.createElement('a');
    a.className = 'docs-pager-link docs-pager-prev';
    a.href = prev.href;
    a.innerHTML = `<span class="docs-pager-label">Назад</span><span class="docs-pager-title">${prev.title}</span>`;
    nav.appendChild(a);
  } else {
    nav.appendChild(document.createElement('span'));
  }

  if (next) {
    const a = document.createElement('a');
    a.className = 'docs-pager-link docs-pager-next';
    a.href = next.href;
    a.innerHTML = `<span class="docs-pager-label">Далее</span><span class="docs-pager-title">${next.title}</span>`;
    nav.appendChild(a);
  }

  return nav;
}

function wrapLayout(file) {
  const main = document.querySelector('.docs-main');
  if (!main || main.closest('.docs-shell')) return;

  ensureIds(main);
  const headings = [...main.querySelectorAll('.docs-section > h2')];

  const shell = document.createElement('div');
  // Do not add grid-container: its `> * { grid-column: 1 }` stacks sidebar + content.
  shell.className = 'docs-shell';

  const content = document.createElement('div');
  content.className = 'docs-content';

  main.classList.remove('grid-container');
  main.parentNode.insertBefore(shell, main);
  shell.appendChild(buildSidebar(file, headings.length >= 2 ? headings : null));
  shell.appendChild(content);

  const toc = buildToc(main);
  if (toc) content.appendChild(toc);
  content.appendChild(main);

  const pager = buildPager(file);
  if (pager) content.appendChild(pager);
}

function enhanceTopNav(file) {
  const links = document.querySelector('.docs-nav-links');
  if (!links) return;

  links.innerHTML = '';
  const brand = document.createElement('a');
  brand.className = 'docs-brand';
  brand.href = 'index.html';
  brand.textContent = 'lite-foundation';
  links.appendChild(brand);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'button tiny hollow docs-nav-toggle';
  toggle.setAttribute('data-docs-nav-toggle', '');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'Меню';
  links.appendChild(toggle);

  FLAT.filter((p) => TOP_NAV.includes(p.href)).forEach((item) => {
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.title;
    a.className = 'docs-nav-desktop';
    if (item.href === file) a.classList.add('is-active');
    links.appendChild(a);
  });

  const sink = document.createElement('a');
  sink.href = '../index.html';
  sink.textContent = 'Kitchen sink';
  sink.className = 'docs-nav-desktop';
  links.appendChild(sink);

  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('docs-nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

/**
 * Support block for the current page. Rendered as a `<details>` so it never
 * pushes the actual documentation below the fold, and placed right after the
 * lead paragraph / feature flags — the place where "can I ship this?" is asked.
 *
 * A page can pin the block elsewhere with `<div data-docs-support></div>`.
 */
function buildSupport(file) {
  const ids = (PAGE_FEATURES[file] || []).filter((id) => FEATURES[id]);
  if (!ids.length) return null;

  const worst = ids.reduce((acc, id) => {
    const rank = { widely: 0, newly: 1, limited: 2 };
    return rank[FEATURES[id].status] > rank[acc] ? FEATURES[id].status : acc;
  }, 'widely');

  const box = document.createElement('details');
  box.className = `docs-support is-${worst}`;
  // Anything with a caveat is worth reading before copying the markup.
  if (worst !== 'widely') box.open = true;

  const summary = document.createElement('summary');
  summary.className = 'docs-support-summary';
  summary.innerHTML =
    `<span>Поддержка браузерами</span>` +
    `<span class="docs-support-badge">${STATUS_LABELS[worst]}</span>`;
  box.appendChild(summary);

  const table = document.createElement('table');
  table.className = 'table docs-support-table';
  table.innerHTML =
    '<thead><tr><th>Возможность</th><th>Chrome / Edge</th><th>Safari</th><th>Firefox</th><th>Статус</th></tr></thead>';

  const tbody = document.createElement('tbody');
  ids.forEach((id) => {
    const f = FEATURES[id];
    const tr = document.createElement('tr');
    tr.innerHTML =
      `<td data-label="Возможность"><a href="${f.caniuse}" target="_blank" rel="noopener">${f.title}</a></td>` +
      `<td data-label="Chrome / Edge">${f.chrome}</td>` +
      `<td data-label="Safari">${f.safari}</td>` +
      `<td data-label="Firefox">${f.firefox}</td>` +
      `<td data-label="Статус"><span class="label ${f.status === 'widely' ? 'success' : f.status === 'newly' ? 'primary' : 'warning'}">${STATUS_LABELS[f.status]}</span></td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  const scroll = document.createElement('div');
  scroll.className = 'table-scroll';
  scroll.appendChild(table);
  box.appendChild(scroll);

  const notes = document.createElement('ul');
  notes.className = 'docs-support-notes';
  ids.forEach((id) => {
    const f = FEATURES[id];
    if (!f.note && !f.fallback) return;
    const li = document.createElement('li');
    li.innerHTML =
      `<strong>${f.title}.</strong> ${f.note || ''}` +
      (f.fallback ? ` <em>Фолбэк:</em> ${f.fallback}` : '');
    notes.appendChild(li);
  });
  if (notes.children.length) box.appendChild(notes);

  const foot = document.createElement('p');
  foot.className = 'docs-support-foot';
  foot.innerHTML =
    'Версии сверены с caniuse в июле 2026 — актуальные смотрите по ссылкам. ' +
    'Полная таблица: <a href="support.html">поддержка браузеров</a>.';
  box.appendChild(foot);

  return box;
}

function insertSupport(file) {
  const main = document.querySelector('.docs-main');
  if (!main || main.querySelector('.docs-support')) return;

  const box = buildSupport(file);
  if (!box) return;

  const slot = main.querySelector('[data-docs-support]');
  if (slot) {
    slot.replaceWith(box);
    return;
  }

  const anchor = main.querySelector('.docs-flags') || main.querySelector('.docs-lead');
  if (anchor) anchor.after(box);
  else main.prepend(box);
}

function setupCopyButtons() {
  document.querySelectorAll('.docs-code').forEach((block) => {
    const pre = block.querySelector('pre');
    if (!pre || block.querySelector('[data-docs-copy]')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'button tiny secondary';
    btn.setAttribute('data-docs-copy', '');
    btn.textContent = 'Copy';
    btn.style.cssText = 'position:absolute;top:0.5rem;inset-inline-end:0.5rem;margin:0;';
    block.style.position = 'relative';
    block.appendChild(btn);

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.textContent || '');
        btn.textContent = 'Copied';
        window.setTimeout(() => {
          btn.textContent = 'Copy';
        }, 1200);
      } catch {
        btn.textContent = 'Failed';
      }
    });
  });
}

const file = currentFile();
// JSX docs pages render their own chrome into #app — don't double-wrap.
if (document.getElementById('app') && !document.querySelector('.docs-main')) {
  // page still booting Preact; nothing to enhance yet
} else if (!document.getElementById('app')) {
  enhanceTopNav(file);
  insertSupport(file);
  wrapLayout(file);
  setupCopyButtons();
}
