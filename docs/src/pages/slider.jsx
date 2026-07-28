import { Section, When, Demo, Code, Aside, Meta } from '../components/primitives.jsx';

export default function SliderPage() {
  return (
    <>
      <Section title="Когда подключать">
        <When
          good={[
            'Hero-карусель, галерея, отзывы — только на страницах, где есть слайдер',
            'Когда размер Swiper (~десятки KB) не должен грузиться глобально',
          ]}
        />
        <Aside>
          Form range-slider (<a href="forms.html">Forms</a>) — другой компонент, без Swiper.
        </Aside>
      </Section>

      <Section title="Подключение">
        <Code
          code={`<link rel="stylesheet" href="dist/app.css">
<link rel="stylesheet" href="dist/lib-swiper.css">
<script type="module" src="dist/lib.js"></script>
<script type="module" src="dist/lib-swiper.js"></script>`}
        />
        <p>
          В DEV: <code>/js/load-build.js?build=full</code> +{' '}
          <code>/js/load-build.js?build=swiper</code>.
        </p>
      </Section>

      <Section title="Разметка">
        <Meta>
          Корень с <code>data-swiper</code> (и классами Swiper). Стрелки и pagination — опционально.
        </Meta>
        <Demo>
          <div class="swiper ks-swiper" data-swiper>
            <div class="swiper-wrapper">
              <div class="swiper-slide">
                <figure>
                  <img
                    src="https://placehold.co/1200x320/1779ba/ffffff?text=Slide+1"
                    alt="Slide 1"
                  />
                  <figcaption>Slide 1</figcaption>
                </figure>
              </div>
              <div class="swiper-slide">
                <figure>
                  <img
                    src="https://placehold.co/1200x320/3adb76/0a0a0a?text=Slide+2"
                    alt="Slide 2"
                  />
                  <figcaption>Slide 2</figcaption>
                </figure>
              </div>
              <div class="swiper-slide">
                <figure>
                  <img
                    src="https://placehold.co/1200x320/cc4b37/ffffff?text=Slide+3"
                    alt="Slide 3"
                  />
                  <figcaption>Slide 3</figcaption>
                </figure>
              </div>
            </div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-pagination"></div>
          </div>
        </Demo>
        <Code
          code={`<div class="swiper" data-swiper>
  <div class="swiper-wrapper">…</div>
  <div class="swiper-button-prev"></div>
  <div class="swiper-button-next"></div>
  <div class="swiper-pagination"></div>
</div>`}
        />
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Подключайте <code>builds.swiper</code> только на страницах с каруселью — не в global
            bundle.
          </li>
          <li>
            Опции Swiper — через <code>data-swiper-*</code> или инициализацию после{' '}
            <code>load-build</code>.
          </li>
          <li>
            Hero-слайдер: один слайд на мобильных, autoplay с уважением{' '}
            <code>prefers-reduced-motion</code>.
          </li>
        </ul>
      </Section>
    </>
  );
}
