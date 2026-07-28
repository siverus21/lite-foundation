import { describe, it, expect, afterEach, vi } from 'vitest';
import { Otp } from '../js/modules/otp.js';

function mount(attrs = 'data-otp-length="4" data-otp-name="code"') {
  document.body.innerHTML = `<div class="otp" data-otp ${attrs}></div>`;
  return document.querySelector('[data-otp]');
}

function fields() {
  return [...document.querySelectorAll('.otp-field')];
}

function typeInto(index, value) {
  const field = fields()[index];
  field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  return field;
}

describe('Otp', () => {
  let otp;

  afterEach(() => {
    otp?.destroy();
    otp = null;
    document.body.innerHTML = '';
  });

  it('builds one box per character plus a hidden field', () => {
    const el = mount();
    otp = new Otp(document);

    expect(fields().length).toBe(4);
    expect(fields()[0].autocomplete).toBe('one-time-code');
    expect(fields()[1].autocomplete).toBe('off');
    expect(fields()[0].inputMode).toBe('numeric');
    expect(el.querySelector('input[type="hidden"]').name).toBe('code');
  });

  it('advances focus while typing and keeps the hidden value in sync', () => {
    const el = mount();
    otp = new Otp(document);

    typeInto(0, '1');
    expect(document.activeElement).toBe(fields()[1]);

    typeInto(1, '2');
    expect(el.querySelector('input[type="hidden"]').value).toBe('12');
    expect(otp.value(el)).toBe('12');
  });

  it('drops non-digits in digit mode', () => {
    mount();
    otp = new Otp(document);

    const field = typeInto(0, 'a');

    expect(field.value).toBe('');
  });

  it('spreads a multi-character value across the boxes (autofill)', () => {
    const el = mount();
    otp = new Otp(document);
    const completed = [];
    el.addEventListener('completed.lf.otp', (event) => completed.push(event.detail.value));

    typeInto(0, '1234');

    expect(fields().map((field) => field.value)).toEqual(['1', '2', '3', '4']);
    expect(completed).toEqual(['1234']);
  });

  it('fires completed.lf.otp once, not on every later keystroke', () => {
    const el = mount('data-otp-length="2"');
    otp = new Otp(document);
    const completed = [];
    el.addEventListener('completed.lf.otp', (event) => completed.push(event.detail.value));

    typeInto(0, '1');
    typeInto(1, '2');
    typeInto(1, '3');

    expect(completed).toEqual(['12']);
  });

  it('Backspace on an empty box clears and focuses the previous one', () => {
    mount();
    otp = new Otp(document);
    typeInto(0, '1');
    typeInto(1, '2');

    const third = fields()[2];
    third.focus();
    third.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));

    expect(fields()[1].value).toBe('');
    expect(document.activeElement).toBe(fields()[1]);
  });

  it('arrow keys move between boxes', () => {
    mount();
    otp = new Otp(document);

    fields()[2].focus();
    fields()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(fields()[1]);

    fields()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(fields()[2]);
  });

  it('set / clear work through the API and the command events', () => {
    const el = mount();
    otp = new Otp(document);

    el.dispatchEvent(new CustomEvent('lf:otp:set', { detail: { value: '9876' } }));
    expect(otp.value(el)).toBe('9876');

    el.dispatchEvent(new CustomEvent('lf:otp:clear'));
    expect(otp.value(el)).toBe('');
    expect(document.activeElement).toBe(fields()[0]);
  });

  it('lf:otp:invalid marks the group and typing clears the mark', () => {
    const el = mount();
    otp = new Otp(document);
    otp.set(el, '1234');

    el.dispatchEvent(new CustomEvent('lf:otp:invalid', { detail: { invalid: true } }));
    expect(el.hasAttribute('data-invalid')).toBe(true);

    typeInto(0, '5');
    expect(el.hasAttribute('data-invalid')).toBe(false);
  });

  it('accepts letters in text mode', () => {
    mount('data-otp-length="3" data-otp-type="text"');
    otp = new Otp(document);

    const field = typeInto(0, 'A');

    expect(field.value).toBe('A');
    expect(field.inputMode).toBe('text');
  });

  it('paste spreads a code across the boxes', () => {
    const el = mount();
    otp = new Otp(document);
    const completed = [];
    el.addEventListener('completed.lf.otp', (event) => completed.push(event.detail.value));

    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', {
      value: { getData: () => '9-8-7-6' },
    });
    fields()[0].dispatchEvent(paste);

    expect(fields().map((field) => field.value)).toEqual(['9', '8', '7', '6']);
    expect(completed).toEqual(['9876']);
  });

  it('data-otp-autosubmit calls requestSubmit on the closest form when complete', () => {
    document.body.innerHTML = `
      <form id="otpForm">
        <div class="otp" data-otp data-otp-length="2" data-otp-name="code" data-otp-autosubmit></div>
      </form>
    `;
    otp = new Otp(document);
    const form = document.getElementById('otpForm');
    const submit = vi.fn();
    form.requestSubmit = submit;

    typeInto(0, '1');
    typeInto(1, '2');

    expect(submit).toHaveBeenCalledTimes(1);
  });
});
