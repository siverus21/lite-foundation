import { mountDocs } from '../mount.jsx';
import ModernCssPage from '../pages/modern-css.jsx';

mountDocs({
  file: 'modern-css.html',
  title: 'Современный CSS',
  kicker: 'UI Kit',
  lead: (
    <>
      Две возможности платформы, которые убирают JS там, где он был обязателен: container queries
      (компонент реагирует на свой контейнер, а не на вьюпорт) и scroll-driven animations (полоса
      прогресса чтения без обработчика скролла). Обе — прогрессивные: где не поддерживаются,
      компонент просто остаётся в состоянии по умолчанию.
    </>
  ),
  flags: ['входит в любой build'],
  beforeChrome: <div class="scroll-progress primary"></div>,
  Page: ModernCssPage,
  onReady() {
    const supported = CSS.supports('animation-timeline: scroll()');
    const el = document.getElementById('docsScrollSupport');
    if (el) {
      el.textContent = supported
        ? 'В этом браузере полоса работает на CSS-таймлайне — JS не участвует.'
        : 'В этом браузере animation-timeline нет: полоса скрыта, если не задать --lf-scroll-progress из JS.';
    }
  },
});
