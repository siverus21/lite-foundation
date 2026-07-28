import { slugify } from '../slug.js';

/** @param {{ title: string, id?: string, children: preact.ComponentChildren }} props */
export function Section({ title, id, children }) {
  const sectionId = id || slugify(title);
  return (
    <section class="docs-section">
      <h2 id={sectionId}>{title}</h2>
      {children}
    </section>
  );
}

/** @param {{ good?: string[], bad?: string[], children?: preact.ComponentChildren }} props */
export function When({ good = [], bad = [], children }) {
  return (
    <>
      {good.length ? (
        <div class="docs-note docs-note--good">
          <strong>Подходит</strong>
          <ul>
            {good.map((item) => (
              <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </div>
      ) : null}
      {bad.length ? (
        <div class="docs-note docs-note--bad">
          <strong>Не подходит</strong>
          <ul>
            {bad.map((item) => (
              <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </div>
      ) : null}
      {children}
    </>
  );
}

/** Live demo island — children are real DOM nodes for foundation modules. */
export function Demo({ children, class: className, label }) {
  return (
    <div class={className ? `docs-demo ${className}` : 'docs-demo'}>
      {label ? <span class="docs-demo-label">{label}</span> : null}
      {children}
    </div>
  );
}

/** Fenced code sample. Pass plain text in `code`. */
export function Code({ code, title }) {
  return (
    <div class="docs-code">
      {title ? <div class="docs-code-head">{title}</div> : null}
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function Aside({ children }) {
  return <p class="docs-aside">{children}</p>;
}

export function Meta({ children }) {
  return <p class="docs-meta">{children}</p>;
}

export function Note({ children, tone = 'info' }) {
  const cls =
    tone === 'good'
      ? 'docs-note docs-note--good'
      : tone === 'bad'
        ? 'docs-note docs-note--bad'
        : tone === 'warn'
          ? 'docs-note docs-note--warn'
          : 'docs-note';
  return <div class={cls}>{children}</div>;
}

/**
 * Anatomy / structure rows: [{ part, detail }]
 * `part` — селектор или имя куска (обернётся в <code>, либо уже HTML).
 */
export function Anatomy({ rows }) {
  return (
    <ul class="docs-anatomy">
      {rows.map((row, i) => {
        const partHtml = /</.test(row.part) ? row.part : `<code>${escapeHtml(row.part)}</code>`;
        return (
          <li key={i}>
            <span dangerouslySetInnerHTML={{ __html: partHtml }} />
            <span dangerouslySetInnerHTML={{ __html: row.detail }} />
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Simple API / settings table.
 * @param {{ columns: string[], rows: (string|preact.ComponentChildren)[][] }} props
 */
export function ApiTable({ columns, rows }) {
  return (
    <div class="docs-api-wrap">
      <table class="hover unstriped">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>
                  {typeof cell === 'string' && cell.includes('<') ? (
                    <span dangerouslySetInnerHTML={{ __html: cell }} />
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Convenience: wrap a string as <code>…</code> HTML for ApiTable cells. */
export function c(text) {
  return `<code>${escapeHtml(text)}</code>`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
