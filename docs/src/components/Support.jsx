import { FEATURES, PAGE_FEATURES, STATUS_LABELS } from '../../assets/support-data.js';

/**
 * Collapsible browser-support block for the current docs page.
 * @param {{ file: string }} props
 */
export function Support({ file }) {
  const ids = (PAGE_FEATURES[file] || []).filter((id) => FEATURES[id]);
  if (!ids.length) return null;

  const rank = { widely: 0, newly: 1, limited: 2 };
  const worst = ids.reduce((acc, id) => (rank[FEATURES[id].status] > rank[acc] ? FEATURES[id].status : acc), 'widely');

  return (
    <details class={`docs-support is-${worst}`} open={worst !== 'widely' || undefined}>
      <summary class="docs-support-summary">
        <span>Поддержка браузерами</span>
        <span class="docs-support-badge">{STATUS_LABELS[worst]}</span>
      </summary>
      <div class="table-scroll">
        <table class="table docs-support-table">
          <thead>
            <tr>
              <th>Возможность</th>
              <th>Chrome / Edge</th>
              <th>Safari</th>
              <th>Firefox</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {ids.map((id) => {
              const f = FEATURES[id];
              const labelClass =
                f.status === 'widely' ? 'success' : f.status === 'newly' ? 'primary' : 'warning';
              return (
                <tr key={id}>
                  <td data-label="Возможность">
                    <a href={f.caniuse} target="_blank" rel="noopener">
                      {f.title}
                    </a>
                  </td>
                  <td data-label="Chrome / Edge">{f.chrome}</td>
                  <td data-label="Safari">{f.safari}</td>
                  <td data-label="Firefox">{f.firefox}</td>
                  <td data-label="Статус">
                    <span class={`label ${labelClass}`}>{STATUS_LABELS[f.status]}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ul class="docs-support-notes">
        {ids
          .filter((id) => FEATURES[id].note || FEATURES[id].fallback)
          .map((id) => {
            const f = FEATURES[id];
            return (
              <li key={id}>
                <strong>{f.title}.</strong> {f.note || ''}
                {f.fallback ? (
                  <>
                    {' '}
                    <em>Фолбэк:</em> {f.fallback}
                  </>
                ) : null}
              </li>
            );
          })}
      </ul>
      <p class="docs-support-foot">
        Версии сверены с caniuse в июле 2026 — актуальные смотрите по ссылкам. Полная таблица:{' '}
        <a href="support.html">поддержка браузеров</a>.
      </p>
    </details>
  );
}
