import { mountDocs } from '../mount.jsx';
import SliderPage from '../pages/slider.jsx';

mountDocs({
  file: 'slider.html',
  title: 'Slider (Swiper)',
  kicker: 'Library build',
  lead: (
    <>
      Карусель вынесена в library-бандл, чтобы не раздувать основной <code>app.css</code> /{' '}
      <code>lib.js</code>. На странице нужны оба набора: page + <code>lib-swiper</code>.
    </>
  ),
  flags: ['builds.swiper', 'kind: library', 'vendors.swiper'],
  extraBuilds: ['swiper'],
  Page: SliderPage,
});
