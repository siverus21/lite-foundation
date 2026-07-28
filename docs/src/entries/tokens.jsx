import { mountDocs } from '../mount.jsx';
import TokensPage from '../pages/tokens.jsx';

const THEMES = {
  default: {
    '--lf-color-primary': '#1779ba',
    '--lf-color-primary-contrast': '#fefefe',
    '--lf-color-primary-hover': '#126198',
    '--lf-color-primary-hollow-hover': '#0b3c5d',
    '--lf-button-bg': '#1779ba',
    '--lf-button-bg-hover': '#126198',
    '--lf-button-color': '#fefefe',
    '--lf-anchor-color': '#1779ba',
    '--lf-body-bg': '#fefefe',
    '--lf-body-color': '#0a0a0a',
  },
  ocean: {
    '--lf-color-primary': '#0ea5e9',
    '--lf-color-primary-contrast': '#0b1220',
    '--lf-color-primary-hover': '#0284c7',
    '--lf-color-primary-hollow-hover': '#38bdf8',
    '--lf-button-bg': '#0ea5e9',
    '--lf-button-bg-hover': '#0284c7',
    '--lf-button-color': '#0b1220',
    '--lf-anchor-color': '#38bdf8',
    '--lf-body-bg': '#0b1220',
    '--lf-body-color': '#f8fafc',
  },
  warm: {
    '--lf-color-primary': '#c2410c',
    '--lf-color-primary-contrast': '#fff7ed',
    '--lf-color-primary-hover': '#9a3412',
    '--lf-color-primary-hollow-hover': '#7c2d12',
    '--lf-button-bg': '#c2410c',
    '--lf-button-bg-hover': '#9a3412',
    '--lf-button-color': '#fff7ed',
    '--lf-anchor-color': '#c2410c',
    '--lf-body-bg': '#fff7ed',
    '--lf-body-color': '#431407',
  },
};

mountDocs({
  file: 'tokens.html',
  title: 'CSS-переменные --lf-*',
  kicker: 'Design tokens',
  lead: (
    <>
      Компоненты читают <code>var(--lf-…)</code>. Источник — Sass в <code>scss/settings/</code>, эмит
      в <code>:root</code> через <code>scss/settings/css-variables/</code>. Тему можно менять при
      сборке или в рантайме без пересборки.
    </>
  ),
  Page: TokensPage,
  onReady() {
    const preview = document.getElementById('token-demo');
    if (!preview) return;

    const applyTheme = (name) => {
      const theme = THEMES[name];
      if (!theme) return;
      Object.entries(theme).forEach(([key, value]) => {
        preview.style.setProperty(key, value);
      });
      preview.dataset.theme = name;
    };

    document.querySelectorAll('button[data-theme]').forEach((btn) => {
      btn.addEventListener('click', () => applyTheme(btn.getAttribute('data-theme')));
    });

    applyTheme('default');
  },
});
