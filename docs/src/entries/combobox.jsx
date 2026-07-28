import { mountDocs } from '../mount.jsx';
import ComboboxPage from '../pages/combobox.jsx';

const PRODUCTS = [
  'Кофемолка Wilfa Svart',
  'Кофеварка Moccamaster',
  'Весы Acaia Pearl',
  'Чайник Fellow Stagg EKG',
  'Воронка Hario V60',
  'Фильтры Hario 02',
  'Пресс Espro P7',
  'Термометр Fellow',
];

mountDocs({
  file: 'combobox.html',
  title: 'Combobox / autocomplete',
  kicker: 'Форма',
  lead: (
    <>
      Поле с поиском по списку: город, товар, пользователь. Строится поверх обычного{' '}
      <code>&lt;select&gt;</code> — если JS не загрузился, нативный список остаётся рабочим и
      отправляется с формой. Клавиатура и ARIA по шаблону APG combobox.
    </>
  ),
  flags: ['styles.combobox', 'styles.listbox', 'scripts.combobox'],
  Page: ComboboxPage,
  onReady() {
    const cityStatus = document.getElementById('docsCityStatus');
    const cityRoot = document.getElementById('docsCity')?.closest('.combobox');

    cityRoot?.addEventListener('changed.lf.combobox', (event) => {
      const { value, label, reason } = event.detail;
      if (cityStatus) {
        cityStatus.textContent = value
          ? `changed.lf.combobox → ${label} (${value}), reason: ${reason}`
          : 'Ничего не выбрано';
      }
    });

    const combo = document.getElementById('docsAsyncCombo');
    const status = document.getElementById('docsAsyncStatus');
    if (!combo) return;

    let timer = 0;

    combo.addEventListener('input.lf.combobox', (event) => {
      const { query } = event.detail;
      if (status) status.textContent = `input.lf.combobox → «${query}», запрос…`;

      combo.dispatchEvent(new CustomEvent('lf:combobox:loading', { detail: { loading: true } }));

      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const found = PRODUCTS.filter((title) =>
          title.toLowerCase().includes(query.toLowerCase()),
        ).map((title) => ({ value: title.toLowerCase().replace(/\s+/g, '-'), label: title }));

        combo.dispatchEvent(new CustomEvent('lf:combobox:options', { detail: { options: found } }));
        combo.dispatchEvent(new CustomEvent('lf:combobox:loading', { detail: { loading: false } }));
        if (status) status.textContent = `Пришло вариантов: ${found.length}`;
      }, 300);
    });

    combo.addEventListener('changed.lf.combobox', (event) => {
      const { label, value, reason } = event.detail;
      if (status) {
        status.textContent = value
          ? `changed.lf.combobox → ${label} (${value}), reason: ${reason}`
          : 'Выбор сброшен';
      }
    });
  },
});
