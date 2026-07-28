import { Section, Demo, Code, Aside } from '../components/primitives.jsx';

export default function SupportPage() {
  return (
    <>
      <Section title="Как это читать">
        <div class="docs-note">
          <strong>Три статуса</strong>
          <ul>
            <li>
              <span class="label success">Широко доступно</span> — есть во всех движках больше 2.5
              лет. Можно использовать без оглядки и без фолбэка.
            </li>
            <li>
              <span class="label primary">Доступно недавно</span> — есть во всех актуальных
              движках, но не в старых версиях. Работает у подавляющего большинства; деградирует
              мягко.
            </li>
            <li>
              <span class="label warning">Ограниченно</span> — как минимум один актуальный движок
              не поддерживает. Кит в таких местах даёт фолбэк — колонка «Фолбэк» ниже.
            </li>
          </ul>
        </div>
        <Aside>
          Версии сверены с caniuse.com в июле 2026 и со временем устаревают в сторону «поддержка
          стала шире». Живая правда — по ссылке в первой колонке.
        </Aside>
      </Section>

      <Section title="Полная таблица">
        <div class="table-scroll">
          <table class="table hover" id="supportMatrix" data-table-sort>
            <thead>
              <tr>
                <th data-sort="text">Возможность</th>
                <th data-sort="text">Chrome / Edge</th>
                <th data-sort="text">Safari</th>
                <th data-sort="text">Firefox</th>
                <th data-sort="text">Статус</th>
                <th>Где используется</th>
                <th>Фолбэк</th>
              </tr>
            </thead>
            <tbody />
          </table>
        </div>
      </Section>

      <Section title="Что требует фолбэка">
        <p>
          Три места, где кит не может опереться на платформу напрямую. Во всех трёх страница
          остаётся рабочей — меняется только то, кто делает работу.
        </p>
        <ul>
          <li>
            <strong>Popover.</strong> Нет атрибута <code>popover</code> — модуль{' '}
            <code>scripts.popover</code> сам открывает панель, ловит клик вне и <kbd>Escape</kbd>.
            Нет anchor positioning — он же считает координаты через{' '}
            <code>getBoundingClientRect()</code>. Различия видны на{' '}
            <a href="popover.html">странице Popover</a>: там же живая проверка возможностей
            текущего браузера.
          </li>
          <li>
            <strong>Scroll-driven animations.</strong> Без <code>animation-timeline</code> полоса{' '}
            <code>.scroll-progress</code> стоит на нуле, то есть просто не видна. Если прогресс
            нужен всем — выставляйте <code>--lf-scroll-progress</code> из обработчика скролла:
            CSS-анимация имеет приоритет там, где она работает, поэтому оба механизма можно
            включить одновременно.
          </li>
          <li>
            <strong>Clipboard.</strong> <code>navigator.clipboard</code> доступен только в
            защищённом контексте (https или localhost). На http модуль <code>scripts.copy</code>{' '}
            откатывается на скрытую <code>textarea</code> и{' '}
            <code>document.execCommand('copy')</code>.
          </li>
        </ul>
      </Section>

      <Section title="Чего кит не требует вовсе">
        <ul>
          <li>
            Полифилов и транспиляции: сборка — современный ESM, целевые браузеры задаёт ваш bundler.
          </li>
          <li>jQuery и любых рантайм-зависимостей: JS-модули ничего не подтягивают.</li>
          <li>
            CSS-препроцессора в проекте: <code>dist/*.css</code> — обычный CSS.
          </li>
          <li>
            Экзотики в JS-модулях: только стандартный DOM, <code>CustomEvent</code>,{' '}
            <code>AbortSignal</code> и <code>IntersectionObserver</code> для{' '}
            <code>data-lf-lazy</code>.
          </li>
        </ul>
      </Section>

      <Section title="Добавить свою возможность в таблицу">
        <p>
          Данные лежат в одном файле, обе страницы читают его же. Новая запись автоматически
          появляется и в полной таблице, и в блоке на странице компонента.
        </p>
        <Code
          code={`// docs/assets/support-data.js
export const FEATURES = {
  'view-transitions': {
    title: 'View Transitions API',
    chrome: '111+', safari: '18+', firefox: '—',
    status: 'limited',
    caniuse: 'https://caniuse.com/view-transitions',
    note: 'Плавный переход между состояниями списка.',
    fallback: 'Без поддержки состояние меняется мгновенно.',
  },
};

export const PAGE_FEATURES = {
  'my-component.html': ['view-transitions'],
};`}
        />
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Новая платформенная фича — одна запись в <code>FEATURES</code> + id в{' '}
            <code>PAGE_FEATURES</code> для страницы компонента.
          </li>
          <li>
            Колонка «Где используется» — дополни <code>FEATURE_USERS</code> для обратного поиска.
          </li>
          <li>
            Статус <code>limited</code> — всегда указывай <code>fallback</code> в данных.
          </li>
        </ul>
      </Section>
    </>
  );
}
