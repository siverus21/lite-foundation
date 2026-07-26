import './vendors.js';
import { initModules } from './modules.js';
import { boot } from '../../boot.js';

boot({
  initModules,
  cssHrefEndsWith: 'lib-swiper.css',
  loadDevScss: import.meta.env.DEV
    ? async () => {
        await import('../../../scss/builds/swiper/app.scss');
      }
    : undefined,
});
