/**
 * Swiper slider (replaces Foundation Orbit).
 */
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Module } from '../core/Module.js';

export class Slider extends Module {
  constructor(root = document) {
    super(root);
    this.instances = [];

    root.querySelectorAll('.swiper.ks-swiper, [data-swiper]').forEach((el) => {
      if (el.dataset.lfSwiperInit === '1') return;
      el.dataset.lfSwiperInit = '1';
      this.instances.push(
        new Swiper(el, {
          modules: [Navigation, Pagination],
          loop: true,
          navigation: {
            nextEl: el.querySelector('.swiper-button-next'),
            prevEl: el.querySelector('.swiper-button-prev'),
          },
          pagination: {
            el: el.querySelector('.swiper-pagination'),
            clickable: true,
          },
        }),
      );
    });
  }

  destroy() {
    this.instances.forEach((instance) => {
      try {
        instance.destroy(true, true);
      } catch {
        /* ignore */
      }
    });
    this.instances = [];
    this.root.querySelectorAll('[data-lf-swiper-init]').forEach((el) => {
      delete el.dataset.lfSwiperInit;
    });
    super.destroy();
  }
}
