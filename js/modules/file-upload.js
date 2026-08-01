/**
 * File upload dropzone.
 *
 *   <div class="file-upload" data-file-upload>
 *     <input class="file-upload-input" type="file" id="up" multiple>
 *     <label class="file-upload-drop" for="up">…</label>
 *     <ul class="file-upload-list" data-file-upload-list></ul>
 *   </div>
 *
 * Events on the root, bubbling:
 *   changed.lf.file-upload  detail { files: File[] }
 * Commands on the root:
 *   lf:file-upload:clear
 */
import { Module } from '../core/Module.js';
import { t } from '../core/i18n.js';

function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export class FileUpload extends Module {
  static id = 'file-upload';
  static lazySelector = '[data-file-upload]';

  constructor(root = document) {
    super(root);
    this.mountOnce('[data-file-upload]', (el) => this.#bind(el));
  }

  /** @param {HTMLElement} el */
  #bind(el) {
    const input = el.querySelector('.file-upload-input, input[type="file"]');
    if (!(input instanceof HTMLInputElement)) return;

    const list = el.querySelector('[data-file-upload-list]');
    /** @type {File[]} */
    let files = [];

    const syncDisabled = () => {
      el.classList.toggle('is-disabled', input.disabled);
    };
    syncDisabled();

    const render = () => {
      if (!list) return;
      list.replaceChildren();
      files.forEach((file, index) => {
        const li = document.createElement('li');
        li.className = 'file-upload-item';
        li.innerHTML = '';
        const name = document.createElement('span');
        name.className = 'file-upload-item-name';
        name.textContent = file.name;
        const meta = document.createElement('span');
        meta.className = 'file-upload-item-meta';
        meta.textContent = formatSize(file.size);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'button tiny clear file-upload-item-remove';
        remove.setAttribute('data-file-upload-remove', String(index));
        remove.setAttribute('aria-label', `${t('clear')}: ${file.name}`);
        remove.textContent = '×';
        li.append(name, meta, remove);
        list.append(li);
      });
    };

    const setFiles = (next) => {
      files = [...next];
      // Reflect selection into the input via DataTransfer when supported.
      try {
        const dt = new DataTransfer();
        files.forEach((f) => dt.items.add(f));
        input.files = dt.files;
      } catch {
        /* Safari / older: keep internal list; input may stay empty after drop */
      }
      render();
      this.emit(el, 'changed', { files: [...files] });
    };

    this.on(input, 'change', () => {
      setFiles(input.files ? [...input.files] : []);
    });

    this.on(el, 'dragenter', (event) => {
      event.preventDefault();
      if (!input.disabled) el.classList.add('is-dragover');
    });
    this.on(el, 'dragover', (event) => {
      event.preventDefault();
      if (!input.disabled) el.classList.add('is-dragover');
    });
    this.on(el, 'dragleave', (event) => {
      if (!el.contains(/** @type {Node} */ (event.relatedTarget))) {
        el.classList.remove('is-dragover');
      }
    });
    this.on(el, 'drop', (event) => {
      event.preventDefault();
      el.classList.remove('is-dragover');
      if (input.disabled) return;
      const dropped = event.dataTransfer?.files;
      if (!dropped?.length) return;
      if (input.multiple) setFiles([...files, ...dropped]);
      else setFiles([dropped[0]]);
    });

    this.on(el, 'click', (event) => {
      const btn = event.target.closest('[data-file-upload-remove]');
      if (!btn || !el.contains(btn)) return;
      const index = Number(btn.getAttribute('data-file-upload-remove'));
      if (!Number.isInteger(index)) return;
      setFiles(files.filter((_, i) => i !== index));
    });

    this.commands(el, {
      clear: () => setFiles([]),
    });
  }
}
