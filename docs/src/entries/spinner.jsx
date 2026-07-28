import { mountDocs } from '../mount.jsx';
import SpinnerPage from '../pages/spinner.jsx';

mountDocs({
  file: 'spinner.html',
  documentTitle: 'Spinner & Skeleton — lite-foundation docs',
  title: 'Spinner & Skeleton',
  kicker: 'Component',
  lead: (
    <>
      Два способа показать «идёт загрузка»: вращающийся <code>.spinner</code> для коротких
      операций и <code>.skeleton</code>-плейсхолдеры для контента, который вот-вот появится. Оба —
      чистый CSS, уважают <code>prefers-reduced-motion</code>.
    </>
  ),
  flags: ['styles.spinner'],
  Page: SpinnerPage,
  onReady() {
    const toggle = document.getElementById('docsSkeletonToggle');
    const body = document.getElementById('docsSkeletonCardBody');
    const template = document.getElementById('docsProfileRealContent');
    if (!toggle || !body || !template) return;

    let loaded = false;
    toggle.addEventListener('click', () => {
      if (loaded) return;
      toggle.disabled = true;
      toggle.textContent = 'Загрузка…';
      window.setTimeout(() => {
        body.replaceChildren(template.content.cloneNode(true));
        body.removeAttribute('aria-hidden');
        toggle.textContent = 'Данные загружены ✓';
        loaded = true;
      }, 900);
    });
  },
});
