import { mountDocs } from '../mount.jsx';
import ChipPage from '../pages/chip.jsx';

mountDocs({
  file: 'chip.html',
  title: 'Chip / Tag',
  documentTitle: 'Chip / Tag — lite-foundation docs',
  kicker: 'Component',
  lead: (
    <>
      Компактная метка: фильтр, тег, выбранное значение мультиселекта. Удаляемый чип работает
      бесплатно через уже существующий <code>scripts.dismiss</code> — отдельный JS не нужен.
    </>
  ),
  flags: ['styles.chip', 'scripts.dismiss (для удаляемых)'],
  Page: ChipPage,
  onReady() {
    const chip = document.getElementById('docsDismissChip');
    const status = document.getElementById('docsDismissStatus');
    if (!chip || !status) return;

    chip.addEventListener('lf:dismiss', (event) => {
      event.preventDefault();
      chip.style.opacity = '0.5';
      status.textContent = 'Удаление на сервере…';

      window.setTimeout(() => {
        chip.remove();
        status.textContent = 'Готово — тег удалён (симуляция).';
      }, 600);
    });
  },
});
