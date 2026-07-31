/**
 * Accessible tabs.
 *
 *   <ul class="tabs" data-tabs id="pricing">
 *     <li class="tabs-title is-active">
 *       <a role="tab" aria-selected="true" aria-controls="panel-month" href="#panel-month">Месяц</a>
 *     </li>
 *   </ul>
 *   <div class="tabs-content" data-tabs-content="pricing">
 *     <div class="tabs-panel is-active" id="panel-month">…</div>
 *   </div>
 *
 * Panels are found by `data-tabs-content="<tablist id>"`, or by the next sibling
 * `.tabs-content` when the tablist has no id.
 *
 * Keyboard: ←/→ move and activate, Home/End jump to the ends (the WAI-ARIA
 * "tabs with automatic activation" pattern).
 *
 * Event on the tablist: `changed.lf.tabs`, detail { index, tab, panel }.
 * Commands on the tablist:
 *   lf:tabs:select  { index } or { id: 'panel-month' }
 *   lf:tabs:next
 *   lf:tabs:prev
 * Instance API: select(tablist, index), activeIndex(tablist).
 */
import { Module } from '../core/Module.js';

export class Tabs extends Module {
  static id = 'tabs';
  static lazySelector = '[data-tabs]';

  constructor(root = document) {
    super(root);
    this.mountAll('[data-tabs]', (tablist) => this.#setup(tablist));
  }

  #setup(tablist) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const contentRoot = Tabs.#contentRootFor(tablist);
    const panels = contentRoot ? [...contentRoot.querySelectorAll('.tabs-panel')] : [];
    if (!tabs.length || !panels.length) return;

    const vertical =
      tablist.classList.contains('vertical') ||
      tablist.getAttribute('aria-orientation') === 'vertical' ||
      tablist.hasAttribute('data-tabs-vertical');
    tablist.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
    if (vertical) tablist.classList.add('vertical');

    const state = { tablist, tabs, panels, vertical };
    this.states.set(tablist, state);

    tabs.forEach((tab) => {
      this.on(tab, 'click', (event) => {
        event.preventDefault();
        this.#activate(state, tab);
      });
      this.on(tab, 'keydown', (event) => this.#onKeydown(state, event, tab));
    });

    this.commands(tablist, {
      select: (event) => {
        const { index, id } = event.detail || {};
        const tab =
          typeof index === 'number'
            ? tabs[index]
            : tabs.find((candidate) => candidate.getAttribute('aria-controls') === id);
        if (tab) this.#activate(state, tab);
      },
      next: () => this.#step(state, 1),
      prev: () => this.#step(state, -1),
    });
  }

  static #contentRootFor(tablist) {
    if (tablist.id) {
      // Prefer the same tree as the tablist (subtree / ShadowRoot), then document.
      const tree = tablist.getRootNode?.() ?? document;
      const byId =
        (typeof tree.querySelector === 'function' &&
          tree.querySelector(`[data-tabs-content="${tablist.id}"]`)) ||
        document.querySelector(`[data-tabs-content="${tablist.id}"]`);
      if (byId) return byId;
    }
    const sibling = tablist.nextElementSibling;
    return sibling?.classList.contains('tabs-content') ? sibling : null;
  }

  #onKeydown(state, event, tab) {
    const nextKey = state.vertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = state.vertical ? 'ArrowUp' : 'ArrowLeft';
    const keys = [nextKey, prevKey, 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    // Ignore cross-axis arrows so page scroll / nested widgets keep them.
    if (state.vertical && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) return;
    if (!state.vertical && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) return;

    event.preventDefault();
    const { tabs } = state;
    const index = tabs.indexOf(tab);
    let next = index;

    if (event.key === nextKey) next = (index + 1) % tabs.length;
    if (event.key === prevKey) next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;

    tabs[next].focus();
    this.#activate(state, tabs[next]);
  }

  #step(state, delta) {
    const current = state.tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    const from = current === -1 ? 0 : current;
    const next = (from + delta + state.tabs.length) % state.tabs.length;
    this.#activate(state, state.tabs[next]);
  }

  #activate(state, tab) {
    const panelId = tab.getAttribute('aria-controls');
    if (!panelId) return;

    state.tabs.forEach((candidate) => {
      candidate.setAttribute('aria-selected', 'false');
      candidate.setAttribute('tabindex', '-1');
      candidate.parentElement?.classList.remove('is-active');
    });

    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    tab.parentElement?.classList.add('is-active');

    let activePanel = null;
    state.panels.forEach((panel) => {
      const active = panel.id === panelId;
      panel.classList.toggle('is-active', active);
      if (active) {
        panel.removeAttribute('hidden');
        activePanel = panel;
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    this.emit(state.tablist, 'changed', {
      index: state.tabs.indexOf(tab),
      tab,
      panel: activePanel,
    });
  }

  /** @param {Element} tablist @param {number} index */
  select(tablist, index) {
    const state = this.states.get(tablist);
    const tab = state?.tabs[index];
    if (tab) this.#activate(state, tab);
  }

  /** @param {Element} tablist @returns {number} -1 when nothing is selected */
  activeIndex(tablist) {
    const state = this.states.get(tablist);
    if (!state) return -1;
    return state.tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
  }
}
