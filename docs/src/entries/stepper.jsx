import { mountDocs } from '../mount.jsx';
import StepperPage from '../pages/stepper.jsx';

mountDocs({
  file: 'stepper.html',
  title: 'Stepper',
  kicker: 'Component',
  lead: (
    <>
      Индикатор прогресса многошагового процесса: оформление заказа, мастер настройки. Номер/чек-иконка
      на маркере рисуется через <code>content: attr(data-index)</code> — JS переключает только{' '}
      <code>is-active</code>/<code>is-complete</code>.
    </>
  ),
  flags: ['styles.stepper', 'scripts.stepper'],
  Page: StepperPage,
  onReady() {
    const stepperEl = document.getElementById('docsApiStepper');
    const status = document.getElementById('docsApiStepperStatus');
    if (!stepperEl || !status) return;

    stepperEl.addEventListener('changed.lf.stepper', (event) => {
      status.textContent = `changed.lf.stepper → index: ${event.detail.index}`;
    });

    document.querySelectorAll('[data-docs-goto]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.getAttribute('data-docs-goto'));
        stepperEl.dispatchEvent(new CustomEvent('lf:stepper:goto', { detail: { index } }));
      });
    });
  },
});
