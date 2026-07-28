import { mountDocs } from '../mount.jsx';
import PopoverPage from '../pages/popover.jsx';

mountDocs({
  file: 'popover.html',
  title: 'Popover',
  kicker: 'Component',
  lead: (
    <>
      Панель, привязанная к своей кнопке: меню аккаунта, подсказка с формой, поповер фильтра.
      Построен на нативном атрибуте <code>popover</code> — топ-слой, закрытие по клику вне и{' '}
      <kbd>Escape</kbd> достаются от платформы. Модуль <code>scripts.popover</code> добирает то, чего
      в браузере ещё нет.
    </>
  ),
  flags: ['styles.popover', 'scripts.popover'],
  Page: PopoverPage,
  async onReady() {
    const { popoverSupport } = await import('/js/modules/popover.js');

    const { native, anchor } = popoverSupport();
    const tier = native ? (anchor ? 1 : 2) : 3;

    const row = (ok, text) =>
      `<li><span class="label ${ok ? 'success' : 'warning'}">${ok ? 'есть' : 'нет'}</span> ${text}</li>`;

    const probe = document.getElementById('docsPopoverProbe');
    if (probe) {
      probe.innerHTML =
        row(native, 'атрибут <code>popover</code> — топ-слой, клик вне, Escape') +
        row(anchor, 'CSS anchor positioning — позиционирование без JS') +
        `<li><strong>Уровень ${tier}</strong>: ${
          tier === 1
            ? 'всё делает платформа, модуль только пробрасывает события'
            : tier === 2
              ? 'открытие нативное, позицию считает модуль'
              : 'открытие и позицию полностью берёт на себя модуль'
        }</li>`;
    }

    const panel = document.getElementById('docsPopoverApi');
    const log = document.getElementById('docsPopoverApiLog');
    if (!panel || !log) return;

    document.getElementById('docsPopoverApiShow')?.addEventListener('click', () => {
      panel.dispatchEvent(new CustomEvent('lf:popover:show'));
    });
    document.getElementById('docsPopoverApiHide')?.addEventListener('click', () => {
      panel.dispatchEvent(new CustomEvent('lf:popover:hide'));
    });

    ['shown.lf.popover', 'hidden.lf.popover'].forEach((type) => {
      panel.addEventListener(type, (event) => {
        log.textContent = `${type} → native: ${event.detail.native}`;
      });
    });
  },
});
