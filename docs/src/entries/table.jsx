import { mountDocs } from '../mount.jsx';
import TablePage from '../pages/table.jsx';

mountDocs({
  file: 'table.html',
  title: 'Table',
  kicker: 'Component',
  lead: (
    <>
      Обычная <code>&lt;table&gt;</code> плюс четыре вещи, которых в ней не хватает: зебра и hover,
      липкий заголовок, сортировка по клику и режим «в столбик» на мобильных. Сортировка —
      единственная часть с JS.
    </>
  ),
  flags: ['styles.table', 'styles.emptyState', 'styles.spinner', 'scripts.tableSort'],
  Page: TablePage,
  onReady() {
    document.getElementById('docsSortTable')?.addEventListener('sorted.lf.table', (event) => {
      const { key, direction, type } = event.detail;
      const status = document.getElementById('docsSortStatus');
      if (status) {
        status.textContent = `sorted.lf.table → key: ${key}, type: ${type}, direction: ${direction}`;
      }
    });
  },
});
