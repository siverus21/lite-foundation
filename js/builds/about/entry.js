import './vendors.js';
import { initModules } from './modules.js';
import { boot } from '../../boot.js';

boot({
  initModules,
  cssHrefEndsWith: 'app-about.css',
  loadDevScss: import.meta.env.DEV
    ? async () => {
        await import('../../../scss/builds/about/app.scss');
      }
    : undefined,
});
