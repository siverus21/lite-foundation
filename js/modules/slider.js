/**
 * Swiper carousel (library build `swiper` — not the form range slider).
 *
 *   <div class="swiper" data-swiper>
 *     <div class="swiper-wrapper">
 *       <div class="swiper-slide">…</div>
 *     </div>
 *     <div class="swiper-button-prev"></div>
 *     <div class="swiper-button-next"></div>
 *     <div class="swiper-pagination"></div>
 *   </div>
 *
 * Kitchen-sink also matches `.swiper.ks-swiper`. Navigation / pagination
 * elements are optional — missing nodes are passed through as `null`.
 *
 * Events / commands are not wrapped — use the Swiper instance on
 * `instance.instances[]` if you need them. This module only owns lifecycle:
 * create on mount (`mountOnce`), `destroy()` tears every Swiper down.
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
