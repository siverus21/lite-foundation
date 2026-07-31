import { Section, When, Demo, Code, Aside, Meta, ApiTable, c } from '../components/primitives.jsx';

export default function TooltipPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={[
            'Пояснение к иконке-кнопке или термину (1–2 предложения)',
            'Доп. контекст, который не критичен для выполнения задачи',
          ]}
          bad={[
            'Критичные подписи к полям формы — видимый текст рядом с контролом',
            'Меню действий или форма внутри пузыря — <a href="dropdown.html">Dropdown</a> / <a href="popover.html">Popover</a>',
            'Длинный текст: tooltip обрезается (~12rem) и плохо живёт на тач-устройствах',
          ]}
        />
      </Section>

      <Section title="Разметка">
        <Meta>
          Атрибут специально <code>data-tip</code>, не <code>data-tooltip</code> (чтобы не
          конфликтовать с Foundation title-паттернами). Пузырь рисует CSS через{' '}
          <code>::after</code> / <code>::before</code>.
        </Meta>
        <Demo>
          <p>
            Hover or focus{' '}
            <button type="button" class="button tiny has-tip" data-tip="Keyboard-friendly tip">
              ?
            </button>{' '}
            or{' '}
            <span class="has-tip" data-tip="Plain text tip" tabindex="0">
              this tip
            </span>
            .
          </p>
        </Demo>
        <Code
          code={`<!-- Предпочтительно: naturally focusable host -->
<button type="button" class="button tiny has-tip" data-tip="Keyboard-friendly tip">?</button>

<!-- Текст: добавь tabindex="0", если нужна клавиатурная подсказка -->
<span class="has-tip" data-tip="Plain text tip" tabindex="0">this tip</span>`}
        />
        <Aside>
          Модуль <strong>не</strong> ставит <code>tabindex="0"</code> сам — это засоряло tab order.
          Вешай tip на кнопку/ссылку или задай <code>tabindex</code> осознанно.
        </Aside>
      </Section>

      <Section title="Доступность">
        <ApiTable
          columns={['Поведение', 'Детали']}
          rows={[
            [
              'aria-label',
              <>
                Если нет <code>aria-label</code> и <code>aria-describedby</code>, модуль копирует{' '}
                <code>data-tip</code> в <code>aria-label</code>
              </>,
            ],
            [
              'Существующий a11y',
              <>
                Авторский <code>aria-label</code> / <code>aria-describedby</code> не перезаписывается
              </>,
            ],
            [
              'Показ',
              <>
                CSS: <code>:hover</code> / <code>:focus</code> / <code>:focus-visible</code>
              </>,
            ],
          ]}
        />
        <Code
          title="JS (ручной mount)"
          code={`import { Tooltip } from '/js/modules/tooltip.js';

new Tooltip(document.getElementById('app'));
// Обычно достаточно scripts.tooltip в билдe + initModules`}
        />
      </Section>

      <Section title="Флаги">
        <ul>
          <li>
            <code>styles.tooltip</code> — пузырь и caret
          </li>
          <li>
            <code>scripts.tooltip</code> — aria-label sync (без событий/команд)
          </li>
        </ul>
        <Aside>
          Живая витрина рядом с другими chrome-компонентами —{' '}
          <a href="ui-kit.html#tooltip">ui-kit.html#tooltip</a>.
        </Aside>
      </Section>
    </>
  );
}
