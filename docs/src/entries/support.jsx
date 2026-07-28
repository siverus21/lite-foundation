import { mountDocs } from '../mount.jsx';
import SupportPage from '../pages/support.jsx';
import { FEATURES, FEATURE_USERS, STATUS_LABELS } from '../../assets/support-data.js';

const LABEL_CLASS = { widely: 'success', newly: 'primary', limited: 'warning' };
const RANK = { limited: 0, newly: 1, widely: 2 };

mountDocs({
  file: 'support.html',
  title: 'Поддержка браузерами',
  kicker: 'Совместимость',
  lead: (
    <>
      Все возможности платформы, на которые опирается кит: минимальные версии движков, статус по{' '}
      <a href="https://web.dev/baseline" target="_blank" rel="noopener">
        Baseline
      </a>
      , компоненты-потребители и фолбэк там, где он есть. Тот же источник данных (
      <code>docs/assets/support-data.js</code>) рисует блок «Поддержка браузерами» на страницах
      компонентов.
    </>
  ),
  Page: SupportPage,
  onReady() {
    const tbody = document.querySelector('#supportMatrix tbody');
    if (!tbody) return;

    Object.entries(FEATURES)
      .sort(
        ([, a], [, b]) => RANK[a.status] - RANK[b.status] || a.title.localeCompare(b.title, 'ru'),
      )
      .forEach(([id, feature]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="Возможность">
              <a href="${feature.caniuse}" target="_blank" rel="noopener">${feature.title}</a>
            </td>
            <td data-label="Chrome / Edge">${feature.chrome}</td>
            <td data-label="Safari">${feature.safari}</td>
            <td data-label="Firefox">${feature.firefox}</td>
            <td data-label="Статус" data-sort-value="${RANK[feature.status]}">
              <span class="label ${LABEL_CLASS[feature.status]}">${STATUS_LABELS[feature.status]}</span>
            </td>
            <td data-label="Где используется">${FEATURE_USERS[id] || '—'}</td>
            <td data-label="Фолбэк">${feature.fallback || '—'}</td>`;
        tbody.appendChild(tr);
      });
  },
});
