import { mountDocs } from '../mount.jsx';
import SegmentedPage from '../pages/segmented.jsx';

mountDocs({
  file: 'segmented.html',
  title: 'Segmented control',
  kicker: 'Component',
  lead: (
    <>
      Группа радиокнопок, которая читается как один контрол — как переключатели в iOS и macOS.
      Ноль JS: активная «пилюля» рисуется селектором <code>input:checked + span</code>. Значение
      обычное, уходит с формой.
    </>
  ),
  flags: ['styles.segmented'],
  Page: SegmentedPage,
  onReady() {
    const group = document.getElementById('docsSegDemo');
    const status = document.getElementById('docsSegStatus');
    if (!group || !status) return;

    group.addEventListener('change', (event) => {
      status.textContent = `Выбрано: ${event.target.value}`;
    });
  },
});
