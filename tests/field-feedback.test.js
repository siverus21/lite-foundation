import { describe, it, expect, afterEach } from 'vitest';
import { CharCounter } from '../js/modules/char-counter.js';
import { PasswordStrength } from '../js/modules/password-strength.js';

function typeInto(field, value) {
  field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('CharCounter', () => {
  let counter;

  afterEach(() => {
    counter?.destroy();
    counter = null;
    document.body.innerHTML = '';
  });

  it('renders a counter after the field using maxlength', () => {
    document.body.innerHTML = '<textarea data-char-counter maxlength="10"></textarea>';
    counter = new CharCounter(document);

    const output = document.querySelector('.char-counter');
    expect(output).toBeTruthy();
    expect(output.textContent).toBe('0 / 10');
  });

  it('updates as you type and warns near the limit', () => {
    document.body.innerHTML = '<textarea data-char-counter maxlength="10"></textarea>';
    counter = new CharCounter(document);
    const field = document.querySelector('textarea');
    const output = document.querySelector('.char-counter');

    typeInto(field, '1234');
    expect(output.textContent).toBe('4 / 10');
    expect(output.classList.contains('is-warning')).toBe(false);

    typeInto(field, '12345678');
    expect(output.classList.contains('is-warning')).toBe(true);
  });

  it('marks the field invalid past a soft limit', () => {
    document.body.innerHTML = '<textarea data-char-counter data-char-counter-max="5"></textarea>';
    counter = new CharCounter(document);
    const field = document.querySelector('textarea');
    const events = [];
    field.addEventListener('changed.lf.char-counter', (event) => events.push(event.detail));

    typeInto(field, '123456');

    const output = document.querySelector('.char-counter');
    expect(output.classList.contains('is-over')).toBe(true);
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(events.at(-1)).toEqual({ count: 6, max: 5, remaining: -1, over: true });
  });

  it('supports a custom template', () => {
    document.body.innerHTML =
      '<input data-char-counter maxlength="8" data-char-counter-template="осталось {remaining}">';
    counter = new CharCounter(document);

    typeInto(document.querySelector('input'), 'abc');

    expect(document.querySelector('.char-counter').textContent).toBe('осталось 5');
  });

  it('does nothing without a limit', () => {
    document.body.innerHTML = '<textarea data-char-counter></textarea>';
    counter = new CharCounter(document);

    expect(document.querySelector('.char-counter')).toBe(null);
  });
});

describe('PasswordStrength', () => {
  let strength;

  afterEach(() => {
    strength?.destroy();
    strength = null;
    document.body.innerHTML = '';
  });

  it('renders a meter after the field', () => {
    document.body.innerHTML = '<input type="password" data-password-strength>';
    strength = new PasswordStrength(document);

    const meter = document.querySelector('.password-strength meter');
    expect(meter).toBeTruthy();
    expect(meter.getAttribute('max')).toBe('4');
    expect(meter.getAttribute('value')).toBe('0');
  });

  it('scores length and character classes', () => {
    expect(PasswordStrength.score('').score).toBe(0);
    expect(PasswordStrength.score('abc').score).toBe(1);
    expect(PasswordStrength.score('abcdefgh').score).toBe(1);
    expect(PasswordStrength.score('abcdefG1').score).toBe(3);
    expect(PasswordStrength.score('abcdefG1!superlong').score).toBe(4);
  });

  it('updates the meter and label while typing', () => {
    document.body.innerHTML =
      '<input type="password" data-password-strength data-password-strength-labels="0|плохо|так себе|ок|отлично">';
    strength = new PasswordStrength(document);
    const field = document.querySelector('input');

    typeInto(field, 'abcdefG1!superlong');

    expect(document.querySelector('meter').getAttribute('value')).toBe('4');
    expect(document.querySelector('.password-strength-label').textContent).toBe('отлично');
  });

  it('reports the score and marks the field invalid below the minimum', () => {
    document.body.innerHTML = '<input type="password" data-password-strength data-password-strength-min="3">';
    strength = new PasswordStrength(document);
    const field = document.querySelector('input');
    const events = [];
    field.addEventListener('changed.lf.password-strength', (event) => events.push(event.detail));

    typeInto(field, 'short');
    expect(events.at(-1).ok).toBe(false);
    expect(field.getAttribute('aria-invalid')).toBe('true');

    typeInto(field, 'abcdefG1!superlong');
    expect(events.at(-1)).toMatchObject({ score: 4, ok: true });
    expect(field.getAttribute('aria-invalid')).toBe('false');
  });
});
