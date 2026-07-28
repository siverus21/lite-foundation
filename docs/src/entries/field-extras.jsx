import { mountDocs } from '../mount.jsx';
import FieldExtrasPage from '../pages/field-extras.jsx';

mountDocs({
  file: 'field-extras.html',
  title: 'OTP, счётчик символов, надёжность пароля, копирование',
  documentTitle: 'OTP, счётчик, пароль, copy — lite-foundation docs',
  kicker: 'Форма',
  lead: (
    <>
      Четыре небольших модуля, которые в каждом проекте пишут заново. Все построены поверх нативных
      элементов: <code>&lt;input&gt;</code>, <code>&lt;meter&gt;</code>, <code>&lt;output&gt;</code> —
      поэтому доступность и валидация формы работают сами.
    </>
  ),
  flags: [
    'styles.otp',
    'styles.copy',
    'styles.forms',
    'scripts.otp',
    'scripts.charCounter',
    'scripts.passwordStrength',
    'scripts.copy',
  ],
  Page: FieldExtrasPage,
  onReady() {
    const otp = document.getElementById('docsOtp');
    const otpStatus = document.getElementById('docsOtpStatus');

    otp?.addEventListener('changed.lf.otp', (event) => {
      const { value, complete } = event.detail;
      if (otpStatus) otpStatus.textContent = `changed.lf.otp → «${value}», complete: ${complete}`;
    });

    otp?.addEventListener('completed.lf.otp', (event) => {
      if (otpStatus) {
        otpStatus.textContent = `completed.lf.otp → ${event.detail.value} (здесь был бы запрос к серверу)`;
      }
    });

    const OTP_ACTIONS = {
      clear: () => otp?.dispatchEvent(new CustomEvent('lf:otp:clear')),
      fill: () => otp?.dispatchEvent(new CustomEvent('lf:otp:set', { detail: { value: '123456' } })),
      invalid: () =>
        otp?.dispatchEvent(new CustomEvent('lf:otp:invalid', { detail: { invalid: true } })),
    };

    document.querySelectorAll('[data-docs-otp]').forEach((button) => {
      button.addEventListener('click', () => OTP_ACTIONS[button.getAttribute('data-docs-otp')]?.());
    });

    document.getElementById('docsOtpForm')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const code = new FormData(event.target).get('code');
      if (otpStatus) otpStatus.textContent = `Отправлено: code = ${code || '(пусто)'}`;
    });

    document.getElementById('docsCounterSoft')?.addEventListener('changed.lf.char-counter', (event) => {
      const { count, max, remaining, over } = event.detail;
      const el = document.getElementById('docsCounterStatus');
      if (el) {
        el.textContent = `changed.lf.char-counter → count: ${count}, max: ${max}, remaining: ${remaining}, over: ${over}`;
      }
    });

    document.getElementById('docsPassword')?.addEventListener('changed.lf.password-strength', (event) => {
      const { score, label, ok } = event.detail;
      const el = document.getElementById('docsPasswordStatus');
      if (el) {
        el.textContent = `changed.lf.password-strength → score: ${score}/4, label: ${label}, проходит порог: ${ok}`;
      }
    });

    const copyStatus = document.getElementById('docsCopyStatus');
    document.addEventListener('copied.lf.copy', (event) => {
      if (copyStatus) copyStatus.textContent = `copied.lf.copy → «${event.detail.text}»`;
    });
    document.addEventListener('failed.lf.copy', () => {
      if (copyStatus) {
        copyStatus.textContent = 'failed.lf.copy → буфер недоступен (нужен https или localhost)';
      }
    });
  },
});
