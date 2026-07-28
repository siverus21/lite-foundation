import { Section, When, Demo, Code, Aside, ApiTable, c } from '../components/primitives.jsx';

export default function StepperPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={['Оформление заказа, регистрация в несколько шагов, мастер настройки']}
          bad={['Переключение независимых панелей контента — бери <a href="tabs.html">Tabs</a>']}
        />
      </Section>

      <Section title="Разметка и декларативный API">
        <ul>
          <li>
            Корень: <code>&lt;ol class="stepper" data-stepper [data-clickable]&gt;</code>
          </li>
          <li>
            Шаг:{' '}
            <code>
              &lt;li class="stepper-step [is-active|is-complete]" data-stepper-step&gt;
            </code>
          </li>
          <li>
            <code>data-clickable</code> на корне — клик по шагу сразу переключает на него
          </li>
          <li>
            Навигация: <code>[data-stepper-prev]</code> / <code>[data-stepper-next]</code> рядом со
            степпером
          </li>
          <li>
            Событие наружу: <code>changed.lf.stepper</code> на корне, <code>detail.index</code> —
            новый индекс (с нуля)
          </li>
        </ul>
        <Demo>
          <div class="stepper-wrap">
            <ol class="stepper" data-stepper data-clickable>
              <li class="stepper-step is-complete" data-stepper-step>
                <span class="stepper-step-marker" data-index="1"></span>
                <span class="stepper-step-label">Корзина</span>
              </li>
              <li class="stepper-step is-active" data-stepper-step>
                <span class="stepper-step-marker" data-index="2"></span>
                <span class="stepper-step-label">Доставка</span>
              </li>
              <li class="stepper-step" data-stepper-step>
                <span class="stepper-step-marker" data-index="3"></span>
                <span class="stepper-step-label">Оплата</span>
              </li>
              <li class="stepper-step" data-stepper-step>
                <span class="stepper-step-marker" data-index="4"></span>
                <span class="stepper-step-label">Готово</span>
              </li>
            </ol>
            <div class="docs-demo" style={{ marginTop: '1rem' }}>
              <button class="button tiny secondary" type="button" data-stepper-prev>
                ← Назад
              </button>{' '}
              <button class="button tiny primary" type="button" data-stepper-next>
                Далее →
              </button>
            </div>
          </div>
        </Demo>
        <Code
          code={`<ol class="stepper" data-stepper data-clickable>
  <li class="stepper-step is-complete" data-stepper-step>
    <span class="stepper-step-marker" data-index="1"></span>
    <span class="stepper-step-label">Корзина</span>
  </li>
  <li class="stepper-step is-active" data-stepper-step>
    <span class="stepper-step-marker" data-index="2"></span>
    <span class="stepper-step-label">Доставка</span>
  </li>
</ol>

<button type="button" data-stepper-prev>Назад</button>
<button type="button" data-stepper-next>Далее</button>`}
        />
        <Aside>
          <code>data-stepper-prev</code>/<code>data-stepper-next</code> ищутся модулем внутри
          ближайшего общего родителя со степпером (в примере это <code>.stepper-wrap</code>) —
          кнопки не обязаны быть внутри самого <code>&lt;ol&gt;</code>.
        </Aside>
      </Section>

      <Section title="JS API: переключение шагов из кода">
        <p>
          Часто нужно переключить шаг не по клику пользователя, а программно — например, после
          успешной валидации формы или ответа сервера. Как и Toast, Stepper не требует импорта
          класса или ссылки на инстанс: он слушает три «команды» прямо на своём корневом элементе,
          поэтому достаточно найти степпер по <code>id</code>/селектору и диспатчить событие.
        </p>
        <ApiTable
          columns={['Событие (на корне степпера)', 'detail', 'Эффект']}
          rows={[
            [
              c('lf:stepper:goto'),
              c('{ index }'),
              'Перейти на шаг с абсолютным индексом (с нуля); шаги до него — is-complete',
            ],
            [c('lf:stepper:next'), '—', 'То же самое, что клик по [data-stepper-next]'],
            [c('lf:stepper:prev'), '—', 'То же самое, что клик по [data-stepper-prev]'],
          ]}
        />
        <Code
          code={`const stepperEl = document.getElementById('checkoutStepper');

stepperEl.dispatchEvent(new CustomEvent('lf:stepper:goto', { detail: { index: 2 } }));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (validate(form)) stepperEl.dispatchEvent(new CustomEvent('lf:stepper:next'));
});

stepperEl.addEventListener('changed.lf.stepper', (event) => {
  console.log('Текущий шаг:', event.detail.index);
});`}
        />
        <p>Живой пример — переход на произвольный шаг без клика по самому степперу:</p>
        <Demo>
          <div class="stepper-wrap">
            <ol class="stepper" data-stepper id="docsApiStepper">
              <li class="stepper-step is-active" data-stepper-step>
                <span class="stepper-step-marker" data-index="1"></span>
                <span class="stepper-step-label">Корзина</span>
              </li>
              <li class="stepper-step" data-stepper-step>
                <span class="stepper-step-marker" data-index="2"></span>
                <span class="stepper-step-label">Доставка</span>
              </li>
              <li class="stepper-step" data-stepper-step>
                <span class="stepper-step-marker" data-index="3"></span>
                <span class="stepper-step-label">Оплата</span>
              </li>
              <li class="stepper-step" data-stepper-step>
                <span class="stepper-step-marker" data-index="4"></span>
                <span class="stepper-step-label">Готово</span>
              </li>
            </ol>
          </div>
          <p style={{ marginTop: '1rem' }}>
            <button class="button tiny" type="button" data-docs-goto="0">
              Шаг 1
            </button>{' '}
            <button class="button tiny" type="button" data-docs-goto="1">
              Шаг 2
            </button>{' '}
            <button class="button tiny" type="button" data-docs-goto="2">
              Шаг 3
            </button>{' '}
            <button class="button tiny" type="button" data-docs-goto="3">
              Шаг 4
            </button>
            <span class="docs-aside" id="docsApiStepperStatus" style={{ marginInlineStart: '0.5rem' }}></span>
          </p>
        </Demo>
      </Section>

      <Section title="Вертикальный вариант">
        <p>
          Класс <code>vertical</code> на корне — маркеры и подписи в столбик.
        </p>
        <Demo>
          <ol class="stepper vertical" data-stepper style={{ maxWidth: '16rem' }}>
            <li class="stepper-step is-complete" data-stepper-step>
              <span class="stepper-step-marker" data-index="1"></span>
              <span class="stepper-step-label">Аккаунт создан</span>
            </li>
            <li class="stepper-step is-active" data-stepper-step>
              <span class="stepper-step-marker" data-index="2"></span>
              <span class="stepper-step-label">Подтверждение почты</span>
            </li>
            <li class="stepper-step" data-stepper-step>
              <span class="stepper-step-marker" data-index="3"></span>
              <span class="stepper-step-label">Профиль заполнен</span>
            </li>
          </ol>
        </Demo>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            После валидации шага — <code>lf:stepper:next</code>; при ошибке сервера —{' '}
            <code>lf:stepper:goto</code> назад.
          </li>
          <li>
            <code>changed.lf.stepper</code> + lazy-load контента панели по <code>detail.index</code>
            .
          </li>
          <li>
            Checkout: <code>vertical</code> в сайдбаре на десктопе, горизонтальный на мобильных.
          </li>
        </ul>
      </Section>
    </>
  );
}
