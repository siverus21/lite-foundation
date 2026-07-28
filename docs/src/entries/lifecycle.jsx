import { mountDocs } from '../mount.jsx';
import LifecyclePage from '../pages/lifecycle.jsx';

const DETAILS_SAMPLE = `
<div class="accordion" data-accordion>
  <details class="accordion-item" open>
    <summary class="accordion-title">Injected panel</summary>
    <div class="accordion-content">
      <p>Динамический accordion. После refresh — JS; после destroy — native.</p>
    </div>
  </details>
  <details class="accordion-item">
    <summary class="accordion-title">Ещё один</summary>
    <div class="accordion-content">
      <p>Второй item.</p>
    </div>
  </details>
</div>`;

mountDocs({
  file: 'lifecycle.html',
  title: 'Lifecycle API',
  kicker: 'JavaScript',
  lead: (
    <>
      Модули поднимаются через <code>initModules(root)</code>. После AJAX-вставки HTML вызывай{' '}
      <code>refreshModules(root)</code> — без дублирования listeners.
    </>
  ),
  Page: LifecyclePage,
  async onReady() {
    const { refreshModules, destroyModules, unmountModules } = await import('virtual:lf-modules/full');

    const mount = document.getElementById('docs-mount');
    const status = document.getElementById('docs-lifecycle-status');
    if (!mount || !status) return;

    const setStatus = (text) => {
      status.textContent = `Статус: ${text}`;
    };

    document.getElementById('docs-inject')?.addEventListener('click', () => {
      mount.insertAdjacentHTML('beforeend', DETAILS_SAMPLE);
      setStatus('HTML вставлен (native details). Нажми refreshModules.');
    });

    document.getElementById('docs-refresh')?.addEventListener('click', () => {
      if (!mount.querySelector('[data-accordion]')) {
        setStatus('Сначала вставь accordion.');
        return;
      }
      refreshModules(mount);
      const enhanced = mount.querySelectorAll('[data-lf-enhanced]').length;
      setStatus(`refreshModules — enhanced групп: ${enhanced}.`);
    });

    document.getElementById('docs-destroy')?.addEventListener('click', () => {
      destroyModules(mount);
      const enhanced = mount.querySelectorAll('[data-lf-enhanced]').length;
      setStatus(
        enhanced === 0
          ? 'destroyModules — JS снят, HTML на месте (native details).'
          : `destroyModules вызван, но enhanced ещё: ${enhanced} (не было init на mount?).`,
      );
    });

    document.getElementById('docs-unmount')?.addEventListener('click', () => {
      unmountModules(mount);
      setStatus(
        mount.childNodes.length === 0
          ? 'unmountModules — JS снят, HTML внутри mount очищен.'
          : 'unmountModules вызван, но mount не пуст.',
      );
    });
  },
});
