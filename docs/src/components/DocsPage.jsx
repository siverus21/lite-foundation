import { useEffect, useState } from 'preact/hooks';
import { FLAT, NAV, TOP_NAV } from '../nav.js';
import { Support } from './Support.jsx';

function Sidebar({ file, headings }) {
  return (
    <aside class="docs-sidebar" aria-label="Навигация по документации">
      <a class="docs-sidebar-brand" href="index.html">
        lite-foundation
      </a>
      {NAV.map((group) => (
        <div key={group.group}>
          <p class="docs-sidebar-group">{group.group}</p>
          <ul class="docs-sidebar-list">
            {group.items.map((item) => {
              const active = item.href === file;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    class={active ? 'is-active' : undefined}
                    aria-current={active ? 'page' : 'false'}
                  >
                    {item.title}
                  </a>
                  {active && headings.length >= 2 ? (
                    <ul class="docs-sidebar-toc">
                      {headings.map((h) => (
                        <li key={h.id}>
                          <a href={`#${h.id}`}>{h.text}</a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <a class="docs-sidebar-extra" href="../index.html">
        Kitchen sink →
      </a>
    </aside>
  );
}

function TopNav({ file }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('docs-nav-open', open);
    return () => document.body.classList.remove('docs-nav-open');
  }, [open]);

  return (
    <header class="docs-nav">
      <div class="grid-container">
        <div class="docs-nav-links">
          <a class="docs-brand" href="index.html">
            lite-foundation
          </a>
          <button
            type="button"
            class="button tiny hollow docs-nav-toggle"
            aria-expanded={open ? 'true' : 'false'}
            onClick={() => setOpen((v) => !v)}
          >
            Меню
          </button>
          {FLAT.filter((p) => TOP_NAV.includes(p.href)).map((item) => (
            <a
              key={item.href}
              href={item.href}
              class={`docs-nav-desktop${item.href === file ? ' is-active' : ''}`}
            >
              {item.title}
            </a>
          ))}
          <a href="../index.html" class="docs-nav-desktop">
            Kitchen sink
          </a>
          <button
            type="button"
            class="button tiny hollow docs-theme-toggle"
            data-theme-toggle
            data-theme-label-light="Тёмная"
            data-theme-label-dark="Светлая"
            aria-label="Переключить тему"
          >
            Тема
          </button>
        </div>
      </div>
    </header>
  );
}

function Toc({ headings }) {
  if (headings.length < 2) return null;
  return (
    <nav class="docs-toc" aria-label="На этой странице">
      <p class="docs-toc-title">На этой странице</p>
      <ul class="docs-toc-list">
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Pager({ file }) {
  const index = FLAT.findIndex((p) => p.href === file);
  if (index < 0) return null;
  const prev = FLAT[index - 1];
  const next = FLAT[index + 1];
  if (!prev && !next) return null;

  return (
    <nav class="docs-pager" aria-label="Соседние разделы">
      {prev ? (
        <a class="docs-pager-link docs-pager-prev" href={prev.href}>
          <span class="docs-pager-label">Назад</span>
          <span class="docs-pager-title">{prev.title}</span>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a class="docs-pager-link docs-pager-next" href={next.href}>
          <span class="docs-pager-label">Далее</span>
          <span class="docs-pager-title">{next.title}</span>
        </a>
      ) : null}
    </nav>
  );
}

/**
 * Full docs chrome: top nav (with theme toggle), sidebar, TOC, support, pager.
 */
export function DocsPage({
  file,
  title,
  documentTitle,
  kicker,
  lead,
  flags = [],
  hero = false,
  beforeChrome,
  outsideMain,
  children,
}) {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    document.title = documentTitle || `${title} — lite-foundation docs`;
  }, [documentTitle, title]);

  useEffect(() => {
    const main = document.querySelector('.docs-main');
    if (!main) return;
    const list = [...main.querySelectorAll('.docs-section > h2')].map((h2) => ({
      id: h2.id,
      text: h2.textContent || '',
    }));
    setHeadings(list);
  }, [children, title]);

  useEffect(() => {
    document.querySelectorAll('.docs-code').forEach((block) => {
      const pre = block.querySelector('pre');
      if (!pre || block.querySelector('[data-docs-copy]')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'button tiny secondary';
      btn.setAttribute('data-docs-copy', '');
      btn.textContent = 'Copy';
      btn.style.cssText = 'position:absolute;top:0.45rem;inset-inline-end:0.45rem;margin:0;';
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
  }, [children]);

  const header = (
    <>
      {kicker ? <p class="docs-kicker">{kicker}</p> : null}
      <h1>{title}</h1>
      {lead ? <p class="docs-lead">{lead}</p> : null}
      {flags.length ? (
        <div class="docs-flags">
          {flags.map((f) => (
            <span class="docs-flag" key={f}>
              {f}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );

  return (
    <>
      {beforeChrome}
      <TopNav file={file} />
      {outsideMain}
      <div class="docs-shell">
        <Sidebar file={file} headings={headings} />
        <div class="docs-content">
          <Toc headings={headings} />
          <main class="docs-main">
            {hero ? <div class="docs-hero">{header}</div> : header}
            <Support file={file} />
            {children}
          </main>
          <Pager file={file} />
        </div>
      </div>
    </>
  );
}
