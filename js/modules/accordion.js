/**
 * Accordion on native <details>/<summary> with smooth height animation.
 * Exclusive open waits for the previous panel to finish closing.
 */
export class Accordion {
  constructor(root = document) {
    root.querySelectorAll('[data-accordion]').forEach((el) => {
      new AccordionGroup(el);
    });
  }
}

class AccordionGroup {
  constructor(root) {
    this.root = root;
    this.multi = root.getAttribute('data-multi-expand') === 'true';
    this.queue = Promise.resolve();
    this.#ensureContentWrappers();
    this.#bind();
  }

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
    this.root.querySelectorAll('details.accordion-item').forEach((item) => {
      const summary = item.querySelector(':scope > summary.accordion-title');
      const content = item.querySelector(':scope > .accordion-content');
      if (!summary || !content) return;

      if (item.open) {
        content.style.height = 'auto';
        item.classList.add('is-open');
      } else {
        content.style.height = '0px';
      }

      summary.addEventListener('click', (event) => {
        event.preventDefault();
        this.queue = this.queue.then(() => this.#toggle(item, content));
      });
    });
  }

  async #toggle(item, content) {
    const isOpen = item.open && item.classList.contains('is-open');

    if (isOpen) {
      await this.#close(item, content);
      return;
    }

    if (!this.multi) {
      const openItems = [...this.root.querySelectorAll('details.accordion-item.is-open')];
      for (const other of openItems) {
        if (other === item) continue;
        const otherContent = other.querySelector(':scope > .accordion-content');
        if (otherContent) await this.#close(other, otherContent);
      }
    }

    await this.#open(item, content);
  }

  #open(item, content) {
    return new Promise((resolve) => {
      item.open = true;
      item.classList.add('is-open');

      content.style.height = '0px';
      void content.offsetHeight;

      const inner = content.querySelector('.accordion-content-inner');
      const target = inner ? inner.offsetHeight : content.scrollHeight;
      content.style.height = `${target}px`;

      const finish = () => {
        content.removeEventListener('transitionend', onEnd);
        content.style.height = 'auto';
        resolve();
      };

      const onEnd = (event) => {
        if (event.target !== content || event.propertyName !== 'height') return;
        finish();
      };

      content.addEventListener('transitionend', onEnd);
      window.setTimeout(finish, 500);
    });
  }

  #close(item, content) {
    return new Promise((resolve) => {
      if (!item.open) {
        resolve();
        return;
      }

      const current = content.style.height === 'auto' || !content.style.height
        ? content.scrollHeight
        : content.offsetHeight;

      content.style.height = `${current}px`;
      void content.offsetHeight;
      item.classList.remove('is-open');
      content.style.height = '0px';

      const finish = () => {
        content.removeEventListener('transitionend', onEnd);
        item.open = false;
        resolve();
      };

      const onEnd = (event) => {
        if (event.target !== content || event.propertyName !== 'height') return;
        finish();
      };

      content.addEventListener('transitionend', onEnd);
      window.setTimeout(finish, 500);
    });
  }
}
