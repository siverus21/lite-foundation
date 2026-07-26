import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Tabs } from '../js/modules/tabs.js';

describe('Tabs', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul class="tabs" data-tabs id="t1" role="tablist">
        <li class="tabs-title is-active" role="presentation">
          <button type="button" role="tab" id="tab-a" aria-controls="panel-a" aria-selected="true" tabindex="0">A</button>
        </li>
        <li class="tabs-title" role="presentation">
          <button type="button" role="tab" id="tab-b" aria-controls="panel-b" aria-selected="false" tabindex="-1">B</button>
        </li>
      </ul>
      <div class="tabs-content" data-tabs-content="t1">
        <div class="tabs-panel is-active" id="panel-a" role="tabpanel">A</div>
        <div class="tabs-panel" id="panel-b" role="tabpanel" hidden>B</div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('activates panel on tab click', () => {
    const tabs = new Tabs(document);
    document.getElementById('tab-b').click();

    expect(document.getElementById('tab-b').getAttribute('aria-selected')).toBe('true');
    expect(document.getElementById('panel-b').classList.contains('is-active')).toBe(true);
    expect(document.getElementById('panel-a').hasAttribute('hidden')).toBe(true);

    tabs.destroy();
  });
});
