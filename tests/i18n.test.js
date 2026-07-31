import { describe, it, expect, afterEach } from 'vitest';
import { t, setMessages, resetMessages, messages } from '../js/core/i18n.js';
import { Toast } from '../js/modules/toast.js';
import { Otp } from '../js/modules/otp.js';

describe('i18n', () => {
  afterEach(() => {
    resetMessages();
    document.body.innerHTML = '';
    document.querySelectorAll('.toast-stack').forEach((el) => el.remove());
  });

  it('returns default strings and formats otpDigit', () => {
    expect(t('close')).toBe('Close');
    expect(t('clear')).toBe('Clear');
    expect(t('otpDigit', 2, 6)).toBe('Digit 2 of 6');
    expect(messages()).toHaveProperty('empty');
  });

  it('setMessages overrides catalog entries', () => {
    setMessages({ close: 'Закрыть', otpDigit: (i, n) => `${i}/${n}` });
    expect(t('close')).toBe('Закрыть');
    expect(t('otpDigit', 1, 4)).toBe('1/4');
  });

  it('Toast close button uses t(close)', () => {
    setMessages({ close: 'Закрыть' });
    const toast = new Toast(document);
    const el = toast.show({ message: 'Hi', duration: 0 });
    expect(el.querySelector('.toast-close').getAttribute('aria-label')).toBe('Закрыть');
    toast.destroy();
  });

  it('Otp fields use Digit i of n labels', () => {
    document.body.innerHTML = `<div class="otp" data-otp data-otp-length="3"></div>`;
    const otp = new Otp(document);
    const labels = [...document.querySelectorAll('.otp-field')].map((el) =>
      el.getAttribute('aria-label'),
    );
    expect(labels).toEqual(['Digit 1 of 3', 'Digit 2 of 3', 'Digit 3 of 3']);
    otp.destroy();
  });
});
