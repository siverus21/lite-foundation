import { describe, it, expect, afterEach } from 'vitest';
import axe from 'axe-core';
import { Tabs } from '../js/modules/tabs.js';
import { Accordion } from '../js/modules/accordion.js';
import { Rating } from '../js/modules/rating.js';
import { Modal } from '../js/modules/modal.js';
import { Otp } from '../js/modules/otp.js';
import { Tooltip } from '../js/modules/tooltip.js';
import { Dropdown } from '../js/modules/dropdown.js';
import { InputRecipes } from '../js/modules/input-recipes.js';


/**
 * Run axe against the current document body.
 * Color-contrast is off — happy-dom has no computed styles / CSS cascade.
 */
async function assertNoAxeViolations() {
  const results = await axe.run(document, {
    rules: {
      // Unit fixtures have no stylesheet / page chrome.
      'color-contrast': { enabled: false },
      'link-in-text-block': { enabled: false },
      region: { enabled: false },
      'page-has-heading-one': { enabled: false },
      'landmark-one-main': { enabled: false },
      'html-has-lang': { enabled: false },
      'document-title': { enabled: false },
    },
  });
  expect(results.violations, formatViolations(results.violations)).toEqual([]);
}

function formatViolations(violations) {
  return JSON.stringify(
    violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    })),
    null,
    2,
  );
}

describe('axe-core smoke (key widgets)', () => {
  /** @type {{ destroy?: () => void }[]} */
  let instances = [];

  afterEach(() => {
    instances.forEach((instance) => instance.destroy?.());
    instances = [];
    document.body.innerHTML = '';
  });

  it('Tabs markup after init', async () => {
    document.body.innerHTML = `
      <ul class="tabs" data-tabs id="a11y-tabs" role="tablist" aria-label="Pricing">
        <li class="tabs-title is-active" role="presentation">
          <button type="button" role="tab" id="t-a" aria-controls="p-a" aria-selected="true" tabindex="0">A</button>
        </li>
        <li class="tabs-title" role="presentation">
          <button type="button" role="tab" id="t-b" aria-controls="p-b" aria-selected="false" tabindex="-1">B</button>
        </li>
      </ul>
      <div class="tabs-content" data-tabs-content="a11y-tabs">
        <div class="tabs-panel is-active" id="p-a" role="tabpanel" aria-labelledby="t-a">Panel A</div>
        <div class="tabs-panel" id="p-b" role="tabpanel" aria-labelledby="t-b" hidden>Panel B</div>
      </div>
    `;
    instances.push(new Tabs(document));
    await assertNoAxeViolations();
  });

  it('Accordion on native details/summary', async () => {
    document.body.innerHTML = `
      <div class="accordion" data-accordion>
        <details class="accordion-item" open>
          <summary class="accordion-title">One</summary>
          <div class="accordion-content"><p>Content one</p></div>
        </details>
        <details class="accordion-item">
          <summary class="accordion-title">Two</summary>
          <div class="accordion-content"><p>Content two</p></div>
        </details>
      </div>
    `;
    instances.push(new Accordion(document));
    await assertNoAxeViolations();
  });

  it('Rating radiogroup', async () => {
    document.body.innerHTML = `<div class="rating" data-rating data-rating-max="5" aria-label="Score"></div>`;
    instances.push(new Rating(document));
    await assertNoAxeViolations();
  });

  it('Modal dialog with labelled close', async () => {
    document.body.innerHTML = `
      <button type="button" data-dialog-open="dlg">Open</button>
      <dialog class="modal" id="dlg" aria-labelledby="dlg-title">
        <h2 id="dlg-title">Sign up</h2>
        <button type="button" class="close-button" data-dialog-close aria-label="Close"></button>
        <p>Body</p>
      </dialog>
    `;
    instances.push(new Modal(document));
    await assertNoAxeViolations();
  });

  it('OTP digit fields', async () => {
    document.body.innerHTML = `<div class="otp" data-otp data-otp-length="4" data-otp-name="code" aria-label="One-time code"></div>`;
    instances.push(new Otp(document));
    await assertNoAxeViolations();
  });

  it('Tooltip on focusable host after aria sync', async () => {
    document.body.innerHTML = `
      <button type="button" class="has-tip" data-tip="More info about settings">Settings</button>
    `;
    instances.push(new Tooltip(document));
    await assertNoAxeViolations();
  });

  it('Dropdown trigger + open pane', async () => {
    document.body.innerHTML = `
      <button type="button" data-dropdown-open="a11y-dd"
        aria-expanded="false" aria-controls="a11y-dd">More</button>
      <div class="dropdown-pane" id="a11y-dd" aria-hidden="true" aria-label="More actions">
        <a href="#action">Action</a>
      </div>
    `;
    instances.push(new Dropdown(document));
    // Closed panes with focusable children trip aria-hidden-focus — assert the open state.
    document.querySelector('[data-dropdown-open="a11y-dd"]').click();
    await assertNoAxeViolations();
  });

  it('Vertical tabs after init', async () => {
    document.body.innerHTML = `
      <ul class="tabs vertical" data-tabs id="a11y-vtabs" role="tablist" aria-label="Specs">
        <li class="tabs-title is-active" role="presentation">
          <button type="button" role="tab" id="vt-a" aria-controls="vp-a"
            aria-selected="true" tabindex="0">A</button>
        </li>
        <li class="tabs-title" role="presentation">
          <button type="button" role="tab" id="vt-b" aria-controls="vp-b"
            aria-selected="false" tabindex="-1">B</button>
        </li>
      </ul>
      <div class="tabs-content" data-tabs-content="a11y-vtabs">
        <div class="tabs-panel is-active" id="vp-a" role="tabpanel" aria-labelledby="vt-a">A</div>
        <div class="tabs-panel" id="vp-b" role="tabpanel" aria-labelledby="vt-b" hidden>B</div>
      </div>
    `;
    instances.push(new Tabs(document));
    await assertNoAxeViolations();
  });

  it('Form control + password/search recipes', async () => {
    document.body.innerHTML = `
      <div class="form-control">
        <label class="form-control-label" for="a11y-email">Email</label>
        <input id="a11y-email" type="email" class="input" />
        <p class="form-control-hint" id="a11y-email-hint">We never share this.</p>
      </div>
      <div class="input-group password-input">
        <label class="show-for-sr" for="a11y-pass">Password</label>
        <input id="a11y-pass" class="input-group-field" type="password"
          autocomplete="current-password" />
        <button type="button" class="button secondary password-input-toggle"
          data-password-toggle
          data-text-show="Show" data-text-hide="Hide"
          data-label-show="Show password" data-label-hide="Hide password"
          aria-pressed="false" aria-label="Show password">Show</button>
      </div>
      <div class="input-group search-input">
        <label class="show-for-sr" for="a11y-search">Search</label>
        <span class="input-group-label search-input-icon" aria-hidden="true"></span>
        <input id="a11y-search" class="input-group-field" type="search" placeholder="Search…" />
        <button type="button" class="button clear search-input-clear"
          data-search-clear aria-label="Clear search">×</button>
      </div>
    `;
    instances.push(new InputRecipes(document));
    await assertNoAxeViolations();
  });

  it('CSS-only breadcrumbs + pagination landmarks', async () => {
    document.body.innerHTML = `
      <nav aria-label="Breadcrumb">
        <ul class="breadcrumbs">
          <li><a href="/">Home</a></li>
          <li><span aria-current="page">Here</span></li>
        </ul>
      </nav>
      <nav aria-label="Pagination">
        <ul class="pagination">
          <li class="current"><span class="show-for-sr">You're on page</span> 1</li>
          <li><a href="?page=2" aria-label="Page 2">2</a></li>
        </ul>
      </nav>
    `;
    await assertNoAxeViolations();
  });
});

