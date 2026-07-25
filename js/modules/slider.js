/**
 * Swiper slider (replaces Foundation Orbit).
 * Expects .swiper.ks-swiper (or [data-swiper]) in the DOM.
 */
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

export class Slider {
  constructor(root = document) {
    this.instances = [];

    root.querySelectorAll('.swiper.ks-swiper, [data-swiper]').forEach((el) => {
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
}
