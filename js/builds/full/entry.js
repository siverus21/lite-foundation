import './vendors.js';
import { initModules } from './modules.js';
import { boot } from '../../boot.js';

boot({
  initModules,
  cssHrefEndsWith: 'app.css',
  loadDevScss: import.meta.env.DEV
    ? async () => {
        await import('../../../scss/app.scss');
      }
    : undefined,
});
