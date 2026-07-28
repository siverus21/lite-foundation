import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const destroySpy = vi.fn();
const SwiperMock = vi.fn(function SwiperMock() {
  this.destroy = destroySpy;
});

vi.mock('swiper', () => ({ default: SwiperMock }));
vi.mock('swiper/modules', () => ({
  Navigation: 'Navigation',
  Pagination: 'Pagination',
}));

describe('Slider', () => {
  beforeEach(async () => {
    destroySpy.mockClear();
    SwiperMock.mockClear();
    document.body.innerHTML = `
      <div class="swiper ks-swiper" data-swiper>
        <div class="swiper-wrapper">
          <div class="swiper-slide">1</div>
        </div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
        <div class="swiper-pagination"></div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.resetModules();
  });

  it('constructs Swiper for each carousel and marks ready', async () => {
    const { Slider } = await import('../js/modules/slider.js');
    const slider = new Slider(document);
    const el = document.querySelector('[data-swiper]');

    expect(SwiperMock).toHaveBeenCalledTimes(1);
    expect(el.hasAttribute('data-swiper-ready')).toBe(true);

    // second pass skips already-mounted nodes
    new Slider(document).destroy();
    expect(SwiperMock).toHaveBeenCalledTimes(1);

    slider.destroy();
    expect(destroySpy).toHaveBeenCalled();
    expect(el.hasAttribute('data-swiper-ready')).toBe(false);
  });
});
