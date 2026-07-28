/**
 * Accordion on native <details>/<summary> with smooth height animation.
 *
 * The markup works without JS — `<details>` opens and closes on its own. This
 * module only adds the height transition, single-open behaviour and events, so
 * `destroy()` leaves a plain working accordion behind.
 *
 * Settings (attributes on the root):
 *   data-accordion                 required marker
 *   data-multi-expand="true"       allow several open panels at once
 *
 * Events on the item (<details>), bubbling:
 *   opened.lf.accordion  detail { index }
 *   closed.lf.accordion  detail { index }
 *
 * Command events on the root:
 *   lf:accordion:open    { index }
 *   lf:accordion:close   { index }
 *   lf:accordion:toggle  { index }
 */
import { Module } from '../core/Module.js';
import { animateHeight } from '../core/transition.js';
import { bool } from '../core/attrs.js';

export class Accordion extends Module {
  static id = 'accordion';

  constructor(root = document) {
    super(root);
    /** @type {AccordionGroup[]} */
    this._groups = [];
    this.mountAll('[data-accordion]', (el) => {
      this._groups.push(new AccordionGroup(el, this));
    });
  }

  destroy() {
    this._groups.forEach((group) => group.destroy());
    this._groups = [];
    super.destroy();
  }
}

class AccordionGroup {
  /** @param {Element} root @param {Accordion} owner */
  constructor(root, owner) {
    this.root = root;
    this.owner = owner;
    this.multi = bool(root, 'data-multi-expand');
    /** Serialises animations so two clicks can't fight over the same height. */
    this.queue = Promise.resolve();
    this.root.setAttribute('data-lf-enhanced', '');
    this.#ensureContentWrappers();
    this.#bind();
  }

  destroy() {
    this.root.removeAttribute('data-lf-enhanced');
    this.#items().forEach((item) => {
      const content = this.#contentOf(item);
      if (content) content.style.height = '';
      item.classList.toggle('is-open', item.open);
    });
  }

  #items() {
    return [...this.root.querySelectorAll('details.accordion-item')];
  }

  #contentOf(item) {
    return item.querySelector(':scope > .accordion-content');
  }

  /**
   * The animated element needs a child of its own: transitioning the height of a
   * box whose padding lives on the same element makes the content jump.
   */
  #ensureContentWrappers() {
    this.root.querySelectorAll('.accordion-content').forEach((content) => {
      if (content.querySelector(':scope > .accordion-content-inner')) return;
      const inner = document.createElement('div');
      inner.className = 'accordion-content-inner';
      while (content.firstChild) inner.appendChild(content.firstChild);
      content.appendChild(inner);
    });
  }

  #bind() {
    this.#items().forEach((item) => {
      const summary = item.querySelector(':scope > summary.accordion-title');
      const content = this.#contentOf(item);
      if (!summary || !content) return;

      // Sync the starting state: `open` in the markup must not animate on load.
      content.style.height = item.open ? 'auto' : '0px';
      item.classList.toggle('is-open', item.open);

      this.owner.on(summary, 'click', (event) => {
        event.preventDefault();
        this.enqueue(() => this.#toggle(item));
      });
    });

    this.owner.commands(this.root, {
      open: (event) => this.enqueue(() => this.#openAt(event.detail?.index)),
      close: (event) => this.enqueue(() => this.#closeAt(event.detail?.index)),
      toggle: (event) => {
        const item = this.#items()[event.detail?.index];
        if (item) this.enqueue(() => this.#toggle(item));
      },
    });
  }

  /** @param {() => Promise<void>} task */
  enqueue(task) {
    this.queue = this.queue.then(task).catch(() => {});
    return this.queue;
  }

  async #openAt(index) {
    const item = this.#items()[index];
    if (item && !item.open) await this.#toggle(item);
  }

  async #closeAt(index) {
    const item = this.#items()[index];
    if (item && item.open) await this.#toggle(item);
  }

  async #toggle(item) {
    const content = this.#contentOf(item);
    if (!content) return;

    if (item.open && item.classList.contains('is-open')) {
      await this.#close(item, content);
      return;
    }

    if (!this.multi) {
      for (const other of [...this.root.querySelectorAll('details.accordion-item.is-open')]) {
        if (other === item) continue;
        const otherContent = this.#contentOf(other);
        if (otherContent) await this.#close(other, otherContent);
      }
    }

    await this.#open(item, content);
  }

  async #open(item, content) {
    item.open = true;
    item.classList.add('is-open');

    const inner = content.querySelector('.accordion-content-inner');
    await animateHeight(content, 'open', {
      signal: this.owner.signal,
      measure: () => (inner ? inner.offsetHeight : content.scrollHeight),
    });

    this.owner.emit(item, 'opened', { index: this.#items().indexOf(item) });
  }

  async #close(item, content) {
    if (!item.open) return;

    item.classList.remove('is-open');
    await animateHeight(content, 'close', { signal: this.owner.signal });
    item.open = false;

    this.owner.emit(item, 'closed', { index: this.#items().indexOf(item) });
  }
}
