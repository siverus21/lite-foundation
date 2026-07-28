import { mountDocs } from '../mount.jsx';
import QuantityPage from '../pages/quantity.jsx';

mountDocs({
  file: 'quantity.html',
  title: 'Quantity — input с «+» и «−»',
  kicker: 'Форма',
  lead: (
    <>
      Счётчик количества: кнопки вокруг настоящего <code>&lt;input type="number"&gt;</code>, поэтому
      значение уходит с формой как обычно, а на мобильных открывается цифровая клавиатура. Границы,
      шаг, дробные значения, удержание кнопки, дебаунс запросов к серверу — всё настраивается
      атрибутами.
    </>
  ),
  flags: ['styles.quantity', 'scripts.quantity'],
  Page: QuantityPage,
  onReady() {
    const el = document.getElementById('docsQtyApi');
    const log = document.getElementById('docsQtyLog');
    if (!el || !log) return;

    const fire = (type, detail) => el.dispatchEvent(new CustomEvent(type, { detail }));
    const ACTIONS = {
      set: () => fire('lf:quantity:set', { value: 5 }),
      increase: () => fire('lf:quantity:increase', { by: 3 }),
      limits: () => fire('lf:quantity:limits', { max: 3 }),
      unlimit: () => fire('lf:quantity:limits', { max: null }),
      busy: () => {
        fire('lf:quantity:busy', { busy: true });
        window.setTimeout(() => fire('lf:quantity:busy', { busy: false }), 1500);
      },
    };

    document.querySelectorAll('[data-docs-qty]').forEach((button) => {
      button.addEventListener('click', () => ACTIONS[button.getAttribute('data-docs-qty')]?.());
    });

    el.addEventListener('changed.lf.quantity', (event) => {
      const { value, previous, reason, max } = event.detail;
      log.textContent = `changed → ${previous} → ${value} (reason: ${reason}, max: ${max})`;
    });

    el.addEventListener('committed.lf.quantity', (event) => {
      log.textContent += ` · commit → ${event.detail.value}`;
    });

    const form = document.getElementById('docsQtyForm');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const out = document.getElementById('docsQtyFormResult');
      if (out) out.textContent = `Отправлено: qty = ${new FormData(form).get('qty')}`;
    });
  },
});
