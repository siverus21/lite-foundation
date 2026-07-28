import { mountDocs } from '../mount.jsx';
import TagInputPage from '../pages/tag-input.jsx';

mountDocs({
  file: 'tag-input.html',
  title: 'Tag input',
  kicker: 'Форма',
  lead: (
    <>
      Мультиселект на чипах: теги статьи, получатели письма, навыки в профиле. Каждый тег — отдельный{' '}
      <code>&lt;input type="hidden"&gt;</code>, поэтому на сервер приходит обычный массив, без разбора
      JSON.
    </>
  ),
  flags: ['styles.tagInput', 'styles.chip', 'styles.listbox', 'scripts.tagInput'],
  Page: TagInputPage,
  onReady() {
    const tags = document.getElementById('docsTags');
    const status = document.getElementById('docsTagsStatus');
    const events = document.getElementById('docsTagsEvents');
    if (!tags) return;

    const renderStatus = (list) => {
      if (status) status.textContent = `Текущие теги: ${list.length ? list.join(', ') : '—'}`;
    };

    tags.addEventListener('changed.lf.tag-input', (event) => {
      const { tags: list, added, removed } = event.detail;
      renderStatus(list);
      if (events) {
        events.textContent = `changed.lf.tag-input → ${
          added ? `added: ${added}` : `removed: ${removed}`
        } · всего: ${list.length}`;
      }
    });

    tags.addEventListener('rejected.lf.tag-input', (event) => {
      if (events) {
        events.textContent = `rejected.lf.tag-input → «${event.detail.value}», reason: ${event.detail.reason}`;
      }
    });

    const fire = (type, detail) => tags.dispatchEvent(new CustomEvent(type, { detail }));

    const ACTIONS = {
      add: () => fire('lf:tag-input:add', { value: 'vite' }),
      dup: () => fire('lf:tag-input:add', { value: 'css' }),
      remove: () => fire('lf:tag-input:remove', { value: 'css' }),
      set: () => fire('lf:tag-input:set', { tags: ['css', 'html'] }),
    };

    document.querySelectorAll('[data-docs-tags]').forEach((button) => {
      button.addEventListener('click', () => ACTIONS[button.getAttribute('data-docs-tags')]?.());
    });

    renderStatus(['css', 'доступность']);

    const form = document.getElementById('docsTagsForm');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const list = new FormData(form).getAll('slugs[]');
      const out = document.getElementById('docsTagsFormResult');
      if (out) {
        out.textContent = list.length
          ? `Отправлено: ${list.join(', ')}`
          : 'Ни одного тега — форму отправлять нечему';
      }
    });
  },
});
