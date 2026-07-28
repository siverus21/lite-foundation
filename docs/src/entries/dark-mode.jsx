import { mountDocs } from '../mount.jsx';
import DarkModePage from '../pages/dark-mode.jsx';

mountDocs({
  file: 'dark-mode.html',
  title: 'Тёмная тема',
  kicker: 'Тема',
  lead: (
    <>
      Тёмная схема — это переопределение тех же <code>--lf-*</code> токенов, а не второй набор
      компонентов. Работает без JS: по системной настройке (<code>prefers-color-scheme</code>).
      Модуль <code>scripts.theme</code> нужен только для ручного переключателя «светлая / тёмная /
      авто».
    </>
  ),
  flags: ['входит в любой build', 'scripts.theme'],
  Page: DarkModePage,
  async onReady() {
    const { Theme } = await import('/js/modules/theme.js');
    const status = document.getElementById('docsThemeStatus');
    if (!status) return;

    const render = () => {
      status.textContent = `Theme.mode() → ${Theme.mode()} · Theme.resolved() → ${Theme.resolved()}`;
      document.querySelectorAll('[data-docs-theme-radio]').forEach((radio) => {
        radio.checked = radio.value === Theme.mode();
      });
    };

    document.querySelectorAll('[data-docs-theme-radio]').forEach((radio) => {
      radio.addEventListener('change', () => Theme.set(radio.value));
    });

    document.addEventListener('changed.lf.theme', render);
    render();
  },
});
