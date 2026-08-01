import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileUpload } from '../js/modules/file-upload.js';

describe('FileUpload', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="file-upload" data-file-upload>
        <input class="file-upload-input" type="file" id="up" multiple />
        <label class="file-upload-drop" for="up">
          <span class="file-upload-title">Drop</span>
        </label>
        <ul class="file-upload-list" data-file-upload-list></ul>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('lists files from input change and emits changed.lf.file-upload', () => {
    const mod = new FileUpload(document);
    const root = document.querySelector('[data-file-upload]');
    const input = root.querySelector('input');
    const hits = [];
    root.addEventListener('changed.lf.file-upload', (e) => hits.push(e.detail.files));

    const file = new File(['hi'], 'note.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(hits[0]?.[0]?.name).toBe('note.txt');
    expect(root.querySelectorAll('.file-upload-item')).toHaveLength(1);
    mod.destroy();
  });

  it('clear command empties the list', () => {
    const mod = new FileUpload(document);
    const root = document.querySelector('[data-file-upload]');
    const input = root.querySelector('input');
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    root.dispatchEvent(new CustomEvent('lf:file-upload:clear'));
    expect(root.querySelectorAll('.file-upload-item')).toHaveLength(0);
    mod.destroy();
  });

  it('skips init when no upload roots', () => {
    document.body.innerHTML = '<p>empty</p>';
    expect(() => new FileUpload(document).destroy()).not.toThrow();
  });
});
