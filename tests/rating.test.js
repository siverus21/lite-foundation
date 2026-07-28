import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Rating } from '../js/modules/rating.js';

describe('Rating', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="rating" data-rating data-rating-value="3" data-rating-max="5" data-rating-name="score"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('builds a radiogroup of star buttons + a hidden input from data attributes', () => {
    const rating = new Rating(document);
    const el = document.querySelector('[data-rating]');

    expect(el.getAttribute('role')).toBe('radiogroup');
    const stars = el.querySelectorAll('[data-rating-star]');
    expect(stars.length).toBe(5);
    stars.forEach((star) => expect(star.getAttribute('role')).toBe('radio'));

    const input = el.querySelector('input[type="hidden"]');
    expect(input.name).toBe('score');
    expect(input.value).toBe('3');

    rating.destroy();
  });

  it('marks stars up to the initial value as filled and checked', () => {
    const rating = new Rating(document);
    const stars = document.querySelectorAll('[data-rating-star]');

    expect(stars[0].classList.contains('is-filled')).toBe(true);
    expect(stars[2].classList.contains('is-filled')).toBe(true);
    expect(stars[3].classList.contains('is-filled')).toBe(false);
    expect(stars[2].getAttribute('aria-checked')).toBe('true');
    expect(stars[2].getAttribute('tabindex')).toBe('0');

    rating.destroy();
  });

  it('clicking a star sets the value, updates the input, and dispatches changed.lf.rating', () => {
    const rating = new Rating(document);
    const el = document.querySelector('[data-rating]');
    const stars = document.querySelectorAll('[data-rating-star]');
    const spy = [];
    el.addEventListener('changed.lf.rating', (event) => spy.push(event.detail.value));

    stars[4].click();

    expect(el.querySelector('input').value).toBe('5');
    expect(stars[4].classList.contains('is-filled')).toBe(true);
    expect(spy).toEqual([5]);

    rating.destroy();
  });

  it('previews fill on hover and reverts on mouseleave without changing the value', () => {
    const rating = new Rating(document);
    const el = document.querySelector('[data-rating]');
    const stars = document.querySelectorAll('[data-rating-star]');

    stars[4].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(stars[4].classList.contains('is-hover')).toBe(true);
    expect(el.querySelector('input').value).toBe('3');

    el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(stars[4].classList.contains('is-hover')).toBe(false);

    rating.destroy();
  });

  it('ArrowRight/ArrowLeft step the value by one and move focus to the new star', () => {
    const rating = new Rating(document);
    const el = document.querySelector('[data-rating]');
    const stars = document.querySelectorAll('[data-rating-star]');

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    expect(el.querySelector('input').value).toBe('4');
    expect(document.activeElement).toBe(stars[3]);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
    expect(el.querySelector('input').value).toBe('3');

    rating.destroy();
  });

  it('Home/End jump to the first/last star', () => {
    const rating = new Rating(document);
    const el = document.querySelector('[data-rating]');

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    expect(el.querySelector('input').value).toBe('5');

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    expect(el.querySelector('input').value).toBe('1');

    rating.destroy();
  });

  it('clamps the value to [0, max]', () => {
    document.body.innerHTML = `<div class="rating" data-rating data-rating-value="99" data-rating-max="5"></div>`;
    const rating = new Rating(document);
    expect(document.querySelector('input').value).toBe('5');
    rating.destroy();
  });

  it('skips building a widget for data-readonly ratings', () => {
    document.body.innerHTML = `<div class="rating" data-rating data-readonly data-rating-max="5" data-stars="★★★★★" style="--lf-rating-value: 60%"></div>`;
    const rating = new Rating(document);
    const el = document.querySelector('[data-rating]');

    expect(el.hasAttribute('role')).toBe(false);
    expect(el.querySelectorAll('[data-rating-star]').length).toBe(0);

    rating.destroy();
  });
});
