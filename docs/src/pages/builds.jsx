import { Section, Demo, Code, Aside } from '../components/primitives.jsx';

export default function BuildsPage() {
  return (
    <>
      <Section title="Зачем несколько бандлов">
        <div class="docs-note">
          <strong>
            Page (<code>kind: 'page'</code>, по умолчанию)
          </strong>
          <ul>
            <li>Полная страница: reset, tokens, core, components, utilities, critical</li>
            <li>
              Имена: <code>app.css</code> / <code>lib.js</code> для <code>full</code>; иначе{' '}
              <code>app-{'{name}'}.css</code> / <code>lib-{'{name}'}.js</code>
            </li>
            <li>Когда: шаблон сайта, отдельный лендинг с урезанным набором</li>
          </ul>
        </div>
        <div class="docs-note">
          <strong>
            Library (<code>kind: 'library'</code>)
          </strong>
          <ul>
            <li>Только addon: vendor + связанные components, без core/critical</li>
            <li>
              Имена: <code>lib-{'{name}'}.css</code> / <code>lib-{'{name}'}.js</code>
            </li>
            <li>Когда: Swiper, редкий виджет — грузить только на страницах, где нужен</li>
          </ul>
        </div>
      </Section>

      <Section title="Артефакты после npm run build">
        <Demo>
          <table>
            <thead>
              <tr>
                <th>Ключ</th>
                <th>kind</th>
                <th>CSS</th>
                <th>JS</th>
                <th>Назначение</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>full</code>
                </td>
                <td>page</td>
                <td>
                  <code>app.css</code>
                </td>
                <td>
                  <code>lib.js</code>
                </td>
                <td>Полный набор (kitchen-sink)</td>
              </tr>
              <tr>
                <td>
                  <code>about</code>
                </td>
                <td>page</td>
                <td>
                  <code>app-about.css</code>
                </td>
                <td>
                  <code>lib-about.js</code>
                </td>
                <td>Минимальная демо-страница</td>
              </tr>
              <tr>
                <td>
                  <code>swiper</code>
                </td>
                <td>library</td>
                <td>
                  <code>lib-swiper.css</code>
                </td>
                <td>
                  <code>lib-swiper.js</code>
                </td>
                <td>Карусель поверх page-бандла</td>
              </tr>
            </tbody>
          </table>
        </Demo>
        <Aside>
          Демо page: <a href="../about.html">about.html</a>. Демо library:{' '}
          <a href="slider.html">slider.html</a> / секция Orbit в kitchen-sink.
        </Aside>
      </Section>

      <Section title="Свой library build">
        <p>
          Добавь ключ в <code>builds</code>, укажи <code>kind: 'library'</code> и только нужные
          флаги.
        </p>
        <Code
          code={`// config/features.js
export const builds = {
  full: {},
  swiper: {
    kind: 'library',
    vendors: { swiper: true },
    styles: { slider: true },
    scripts: { slider: true },
  },
};`}
        />
        <Code
          code={`<link rel="stylesheet" href="dist/app.css">
<link rel="stylesheet" href="dist/lib-swiper.css">
<script type="module" src="dist/lib.js"></script>
<script type="module" src="dist/lib-swiper.js"></script>`}
        />
      </Section>

      <Section title="Минимальная page-сборка">
        <p>
          Урезай <code>styles</code>/<code>scripts</code> для страниц без интерактива. Required-слой
          (global, grid, typography, css-variables) всё равно попадёт в page-бандл.
        </p>
        <Code
          code={`about: {
  utilities: true,
  styles: { button: true, callout: true, card: true },
  scripts: {},
},`}
        />
        <Demo>
          <p class="callout primary">Так выглядит callout из about-набора.</p>
          <a class="button primary" href="../about.html">
            Открыть about.html
          </a>
        </Demo>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Отдельный library-билд для тяжёлого vendor (charts, maps) — не тащи его в{' '}
            <code>app.css</code>.
          </li>
          <li>
            Page-билд на каждый шаблон CMS: landing, blog, checkout — разные{' '}
            <code>styles</code>/<code>scripts</code>.
          </li>
          <li>
            В dev подключай через <code>/js/load-build.js?build=about</code> и{' '}
            <code>extraBuilds</code> для library.
          </li>
        </ul>
      </Section>
    </>
  );
}
