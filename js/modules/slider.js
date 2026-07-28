/**
 * Swiper carousel (library build `swiper` — not the form range slider).
 *
 * Markup: `.swiper[data-swiper]` (or kitchen-sink `.swiper.ks-swiper`) with the
 * usual Swiper wrapper / slide / nav / pagination children.
 *
 * Events / commands are not wrapped — talk to the Swiper instance if you need
 * them. This module only owns lifecycle: create on mount, destroy on teardown.
 */
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Module } from '../core/Module.js';

export class Slider extends Module {
  static id = 'swiper';

  constructor(root = document) {
    super(root);
    /** @type {import('swiper').Swiper[]} */
    this.instances = [];

    this.mountOnce('.swiper.ks-swiper, [data-swiper]', (el) => {
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
    super.destroy();
  }
}
