/**
 * Accessible tabs (replaces Foundation Tabs).
 *
 * Markup:
 * <ul class="tabs" data-tabs role="tablist">
 *   <li class="tabs-title is-active"><button type="button" role="tab" aria-controls="panel1" aria-selected="true">…</button></li>
 * </ul>
 * <div class="tabs-content" data-tabs-content>
 *   <div class="tabs-panel is-active" id="panel1" role="tabpanel">…</div>
 * </div>
 */
export class Tabs {
  constructor(root = document) {
    root.querySelectorAll('[data-tabs]').forEach((tablist) => {
      new TabsGroup(tablist);
    });
  }
}

class TabsGroup {
  constructor(tablist) {
    this.tablist = tablist;
    this.tabs = [...tablist.querySelectorAll('[role="tab"]')];

    const contentId = tablist.id;
    const contentRoot = contentId
      ? document.querySelector(`[data-tabs-content="${contentId}"]`)
      : tablist.nextElementSibling?.classList.contains('tabs-content')
        ? tablist.nextElementSibling
        : null;

    this.panels = contentRoot ? [...contentRoot.querySelectorAll('.tabs-panel')] : [];
    if (!this.tabs.length || !this.panels.length) return;

    this.#bind();
  }

  #bind() {
    this.tabs.forEach((tab) => {
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        this.#activate(tab);
      });

      tab.addEventListener('keydown', (event) => this.#onKeydown(event, tab));
    });
  }

  #onKeydown(event, tab) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    event.preventDefault();
    const index = this.tabs.indexOf(tab);
    let next = index;

    if (event.key === 'ArrowRight') next = (index + 1) % this.tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + this.tabs.length) % this.tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = this.tabs.length - 1;

    const nextTab = this.tabs[next];
    nextTab.focus();
    this.#activate(nextTab);
  }

  #activate(tab) {
    const panelId = tab.getAttribute('aria-controls');
    if (!panelId) return;

    this.tabs.forEach((t) => {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
      t.parentElement?.classList.remove('is-active');
    });

    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    tab.parentElement?.classList.add('is-active');

    this.panels.forEach((panel) => {
      const active = panel.id === panelId;
      panel.classList.toggle('is-active', active);
      if (active) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    });
  }
}
