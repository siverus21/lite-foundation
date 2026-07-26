/**
 * Docs chrome: sidebar between pages, in-page TOC, prev/next pager, copy buttons.
 */

const NAV = [
  {
    group: 'Начать',
    items: [
      { href: 'index.html', title: 'Обзор' },
      { href: 'start.html', title: 'Быстрый старт' },
      { href: 'builds.html', title: 'Builds' },
      { href: 'tokens.html', title: 'Токены' },
      { href: 'lifecycle.html', title: 'JS API' },
    ],
  },
  {
    group: 'Компоненты',
    items: [
      { href: 'button.html', title: 'Button' },
      { href: 'forms.html', title: 'Forms' },
      { href: 'modal.html', title: 'Modal' },
      { href: 'tabs.html', title: 'Tabs' },
      { href: 'accordion.html', title: 'Accordion' },
      { href: 'dropdown.html', title: 'Dropdown' },
      { href: 'offcanvas.html', title: 'Off-canvas' },
      { href: 'menus.html', title: 'Menus' },
      { href: 'slider.html', title: 'Slider' },
      { href: 'callout-card.html', title: 'Callout & Card' },
    ],
  },
];

const FLAT = NAV.flatMap((g) => g.items);

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

function buildSidebar(file) {
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
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.title;
      if (item.href === file) a.classList.add('is-active');
      a.setAttribute('aria-current', item.href === file ? 'page' : 'false');
      li.appendChild(a);
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

  const shell = document.createElement('div');
  // Do not add grid-container: its `> * { grid-column: 1 }` stacks sidebar + content.
  shell.className = 'docs-shell';

  const content = document.createElement('div');
  content.className = 'docs-content';

  main.classList.remove('grid-container');
  main.parentNode.insertBefore(shell, main);
  shell.appendChild(buildSidebar(file));
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

  FLAT.filter((p) =>
    ['start.html', 'builds.html', 'tokens.html', 'lifecycle.html'].includes(p.href),
  ).forEach((item) => {
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
enhanceTopNav(file);
wrapLayout(file);
setupCopyButtons();
