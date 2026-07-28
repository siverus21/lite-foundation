import { describe, it, expect, afterEach } from 'vitest';
import { TagInput } from '../js/modules/tag-input.js';

function mount(attrs = '') {
  document.body.innerHTML = `
    <div class="tag-input" data-tag-input data-tag-input-name="tags[]" ${attrs}>
      <input type="text">
    </div>
  `;
  return document.querySelector('[data-tag-input]');
}

function field() {
  return document.querySelector('.tag-input-field');
}

function chips() {
  return [...document.querySelectorAll('[data-tag-chip]')].map((chip) => chip.textContent);
}

function hiddenValues() {
  return [...document.querySelectorAll('input[type="hidden"][data-tag-value]')].map((el) => el.value);
}

function typeAndPress(text, key = 'Enter') {
  field().value = text;
  field().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('TagInput', () => {
  let tagInput;

  afterEach(() => {
    tagInput?.destroy();
    tagInput = null;
    document.body.innerHTML = '';
  });

  it('renders initial tags as chips plus one hidden input each', () => {
    const el = mount('data-tag-input-value="react, vite"');
    tagInput = new TagInput(document);

    expect(chips()).toEqual(['react', 'vite']);
    expect(hiddenValues()).toEqual(['react', 'vite']);
    expect(el.querySelectorAll('input[type="hidden"]').length).toBe(2);
  });

  it('Enter adds a tag and clears the field', () => {
    const el = mount();
    tagInput = new TagInput(document);
    const changes = [];
    el.addEventListener('changed.lf.tag-input', (event) => changes.push(event.detail));

    typeAndPress('css');

    expect(chips()).toEqual(['css']);
    expect(field().value).toBe('');
    expect(changes[0]).toMatchObject({ tags: ['css'], added: 'css' });
  });

  it('the separator key also commits a tag', () => {
    mount();
    tagInput = new TagInput(document);

    typeAndPress('sass', ',');

    expect(chips()).toEqual(['sass']);
  });

  it('rejects duplicates and reports why', () => {
    const el = mount('data-tag-input-value="react"');
    tagInput = new TagInput(document);
    const rejections = [];
    el.addEventListener('rejected.lf.tag-input', (event) => rejections.push(event.detail));

    typeAndPress('react');

    expect(chips()).toEqual(['react']);
    expect(rejections[0]).toEqual({ value: 'react', reason: 'duplicate' });
  });

  it('honours the max and hides the field when full', () => {
    const el = mount('data-tag-input-max="2"');
    tagInput = new TagInput(document);
    const rejections = [];
    el.addEventListener('rejected.lf.tag-input', (event) => rejections.push(event.detail));

    typeAndPress('a');
    typeAndPress('b');
    expect(el.hasAttribute('data-full')).toBe(true);

    typeAndPress('c');
    expect(chips()).toEqual(['a', 'b']);
    expect(rejections[0].reason).toBe('max');
  });

  it('validates against data-tag-input-pattern', () => {
    const el = mount('data-tag-input-pattern="^[a-z-]+$"');
    tagInput = new TagInput(document);
    const rejections = [];
    el.addEventListener('rejected.lf.tag-input', (event) => rejections.push(event.detail));

    typeAndPress('Ok Tag!');

    expect(chips()).toEqual([]);
    expect(rejections[0].reason).toBe('pattern');
  });

  it('lowercases when asked', () => {
    mount('data-tag-input-lowercase');
    tagInput = new TagInput(document);

    typeAndPress('React');

    expect(chips()).toEqual(['react']);
  });

  it('Backspace on an empty field removes the last chip', () => {
    mount('data-tag-input-value="a, b"');
    tagInput = new TagInput(document);

    field().value = '';
    field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));

    expect(chips()).toEqual(['a']);
  });

  it('the chip close button removes its tag', () => {
    const el = mount('data-tag-input-value="a, b"');
    tagInput = new TagInput(document);
    const changes = [];
    el.addEventListener('changed.lf.tag-input', (event) => changes.push(event.detail));

    document.querySelector('[data-tag-remove="a"]').click();

    expect(chips()).toEqual(['b']);
    expect(changes[0].removed).toBe('a');
  });

  it('suggests matching options and picks one on click', () => {
    mount('data-tag-input-suggestions="react, redux, vue"');
    tagInput = new TagInput(document);

    field().value = 're';
    field().dispatchEvent(new Event('input', { bubbles: true }));

    const options = [...document.querySelectorAll('.listbox-option')];
    expect(options.map((li) => li.textContent)).toEqual(['react', 'redux']);
    expect(field().getAttribute('aria-expanded')).toBe('true');

    options[1].click();
    expect(chips()).toEqual(['redux']);
    expect(document.querySelector('.listbox').hidden).toBe(true);
  });

  it('supports command events for add / remove / set / suggestions', () => {
    const el = mount();
    tagInput = new TagInput(document);

    el.dispatchEvent(new CustomEvent('lf:tag-input:add', { detail: { value: 'one' } }));
    el.dispatchEvent(new CustomEvent('lf:tag-input:add', { detail: { value: 'two' } }));
    expect(tagInput.tags(el)).toEqual(['one', 'two']);

    el.dispatchEvent(new CustomEvent('lf:tag-input:remove', { detail: { value: 'one' } }));
    expect(tagInput.tags(el)).toEqual(['two']);

    el.dispatchEvent(new CustomEvent('lf:tag-input:set', { detail: { tags: ['x', 'y'] } }));
    expect(chips()).toEqual(['x', 'y']);

    el.dispatchEvent(new CustomEvent('lf:tag-input:suggestions', { detail: { options: ['zeta'] } }));
    field().value = 'ze';
    field().dispatchEvent(new Event('input', { bubbles: true }));
    expect([...document.querySelectorAll('.listbox-option')].length).toBe(1);
  });

  it('paste splits on the separator into multiple tags', () => {
    const el = mount();
    tagInput = new TagInput(document);

    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', {
      value: { getData: () => 'one, two, three' },
    });
    field().dispatchEvent(paste);

    expect(tagInput.tags(el)).toEqual(['one', 'two', 'three']);
    expect(chips()).toEqual(['one', 'two', 'three']);
  });
});
