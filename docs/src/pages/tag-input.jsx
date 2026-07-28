import { Section, Demo, Code, Aside, ApiTable, c } from '../components/primitives.jsx';

export default function TagInputPage() {
  return (
    <>
      <Section title="Разметка">
        <p>
          Корень и текстовое поле — остальное (чипы, скрытые поля, список подсказок, подпись-хинт)
          генерирует модуль.
        </p>
        <Demo>
          <label for="docsTagsField">Теги статьи</label>
          <div
            class="tag-input"
            data-tag-input
            id="docsTags"
            data-tag-input-name="tags[]"
            data-tag-input-value="css, доступность"
            data-tag-input-max="6"
            data-tag-input-lowercase
            data-tag-input-suggestions="javascript, css, доступность, производительность, тестирование, вёрстка"
            data-tag-input-hint="Enter или запятая — добавить, Backspace — удалить последний"
          >
            <input class="tag-input-field" type="text" id="docsTagsField" placeholder="Добавить тег…" />
          </div>
          <Aside>
            <span id="docsTagsStatus"></span>
          </Aside>
        </Demo>
        <Code
          code={`<div class="tag-input" data-tag-input
     data-tag-input-name="tags[]"
     data-tag-input-value="css, доступность"
     data-tag-input-max="6"
     data-tag-input-lowercase
     data-tag-input-suggestions="javascript, css, вёрстка"
     data-tag-input-hint="Enter — добавить">
  <input class="tag-input-field" type="text" placeholder="Добавить тег…">
</div>`}
        />
        <p>Что уходит на сервер:</p>
        <Code
          code={`<input type="hidden" name="tags[]" value="css">
<input type="hidden" name="tags[]" value="доступность">

// PHP:  $_POST['tags']            → ['css', 'доступность']
// Node: formData.getAll('tags[]') → ['css', 'доступность']`}
        />
      </Section>

      <Section title="Настройки">
        <ApiTable
          columns={['Атрибут', 'По умолчанию', 'Что делает']}
          rows={[
            [c('data-tag-input-name'), '—', <>name скрытых полей. Для массива — с <code>[]</code></>],
            [c('data-tag-input-value'), '—', 'Начальные теги через разделитель'],
            [c('data-tag-input-max'), '∞', 'Предел; по достижении поле ввода скрывается'],
            [c('data-tag-input-separator'), c(','), 'Разделитель — им же режется вставленный текст'],
            [c('data-tag-input-pattern'), '—', <>Регулярка для проверки тега, например <code>^[a-z0-9-]+$</code></>],
            [c('data-tag-input-lowercase'), 'выкл.', 'Приводить к нижнему регистру — «CSS» и «css» станут одним тегом'],
            [c('data-tag-input-suggestions'), '—', 'Статический список подсказок'],
            [c('data-tag-input-hint'), '—', 'Подпись под полем'],
          ]}
        />
      </Section>

      <Section title="Клавиатура и мышь">
        <ApiTable
          columns={['Действие', 'Результат']}
          rows={[
            [<><kbd>Enter</kbd> или разделитель</>, 'Добавить набранное'],
            [<><kbd>Backspace</kbd> в пустом поле</>, 'Удалить последний тег'],
            [<><kbd>↓</kbd> / <kbd>↑</kbd>, <kbd>Enter</kbd></>, 'Выбрать из подсказок'],
            [<kbd>Escape</kbd>, 'Закрыть подсказки'],
            ['Вставка текста', 'Режется по разделителю: «css, html, js» → три тега'],
            ['× на чипе', 'Удалить тег'],
            ['Клик по пустому месту корня', 'Фокус в поле ввода'],
          ]}
        />
      </Section>

      <Section title="События">
        <ApiTable
          columns={['Событие (на корне)', 'detail', 'Когда']}
          rows={[
            [
              c('changed.lf.tag-input'),
              c('{ tags, added, removed }'),
              <>
                Набор изменился. <code>tags</code> — актуальный массив, <code>added</code>/
                <code>removed</code> — что именно произошло
              </>,
            ],
            [
              c('rejected.lf.tag-input'),
              c('{ value, reason }'),
              <>
                Тег не приняли. <code>reason</code>: <code>'duplicate'</code>, <code>'max'</code>,{' '}
                <code>'pattern'</code>, <code>'empty'</code>
              </>,
            ],
          ]}
        />
        <h3>Командные события</h3>
        <ApiTable
          columns={['Событие', 'detail', 'Эффект']}
          rows={[
            [c('lf:tag-input:add'), c('{ value }'), 'Добавить тег'],
            [c('lf:tag-input:remove'), c('{ value }'), 'Удалить тег'],
            [c('lf:tag-input:set'), c('{ tags }'), 'Заменить весь набор'],
            [c('lf:tag-input:suggestions'), c('{ options }'), 'Обновить подсказки — например, ответом сервера'],
          ]}
        />
        <Code
          code={`const tags = document.getElementById('articleTags');

// Автосохранение черновика
tags.addEventListener('changed.lf.tag-input', (event) => {
  const { tags: list, added, removed } = event.detail;
  saveDraft({ tags: list });
  if (added) analytics.track('tag_added', { tag: added });
});

// Объяснить отказ — молчаливое игнорирование выглядит как баг
tags.addEventListener('rejected.lf.tag-input', (event) => {
  const { value, reason } = event.detail;
  const message = {
    duplicate: \`«\${value}» уже добавлен\`,
    max: 'Достигнут предел количества тегов',
    pattern: 'Только латиница, цифры и дефис',
    empty: '',
  }[reason];
  if (message) {
    document.dispatchEvent(new CustomEvent('lf:toast', {
      detail: { message, variant: 'warning' },
    }));
  }
});

// Подсказки с сервера
input.addEventListener('input', async (event) => {
  const found = await fetch(\`/api/tags?q=\${event.target.value}\`).then((r) => r.json());
  tags.dispatchEvent(new CustomEvent('lf:tag-input:suggestions', { detail: { options: found } }));
});

// Управление набором из кода
tags.dispatchEvent(new CustomEvent('lf:tag-input:add', { detail: { value: 'css' } }));
tags.dispatchEvent(new CustomEvent('lf:tag-input:set', { detail: { tags: ['css', 'html'] } }));`}
        />
        <Demo>
          <p>
            <button class="button tiny" type="button" data-docs-tags="add">
              add «vite»
            </button>{' '}
            <button class="button tiny" type="button" data-docs-tags="dup">
              add «css» (дубль)
            </button>{' '}
            <button class="button tiny" type="button" data-docs-tags="remove">
              remove «css»
            </button>{' '}
            <button class="button tiny" type="button" data-docs-tags="set">
              set 2 тега
            </button>
          </p>
          <Aside>
            <span id="docsTagsEvents">События появятся здесь</span>
          </Aside>
        </Demo>
      </Section>

      <Section title="Методы инстанса">
        <Code
          code={`import { TagInput } from 'lite-foundation/js/modules/tag-input.js';

const tagInputs = new TagInput(document.getElementById('editor'));
const el = document.getElementById('articleTags');

tagInputs.tags(el);                  // ['css', 'доступность']
tagInputs.add(el, 'vite');           // соблюдает max, pattern и дубли
tagInputs.remove(el, 'css');
tagInputs.set(el, ['css', 'html']);  // заменить набор целиком
tagInputs.destroy();`}
        />
      </Section>

      <Section title="Валидация">
        <ul>
          <li>
            Дубли отсекаются всегда. С <code>data-tag-input-lowercase</code> — без учёта регистра.
          </li>
          <li>
            <code>data-tag-input-pattern</code> — своя регулярка. Не прошло →{' '}
            <code>rejected.lf.tag-input</code> с <code>reason: 'pattern'</code>; текст остаётся в
            поле, чтобы его можно было поправить.
          </li>
          <li>
            «Обязательное поле» нативно не выразить — скрытых полей нет, пока нет тегов. Проверяйте на{' '}
            <code>submit</code>: <code>if (!tagInputs.tags(el).length) …</code>
          </li>
          <li>
            И на сервере тоже: <code>max</code> и <code>pattern</code> в разметке — это UX, а не
            защита.
          </li>
        </ul>
        <Demo>
          <form id="docsTagsForm">
            <label for="docsSlugField">Слаги (только a-z, цифры, дефис)</label>
            <div
              class="tag-input"
              data-tag-input
              id="docsSlugTags"
              data-tag-input-name="slugs[]"
              data-tag-input-pattern="^[a-z0-9-]+$"
              data-tag-input-lowercase
              data-tag-input-hint="Попробуйте ввести «Привет мир» — тег не примут"
            >
              <input class="tag-input-field" type="text" id="docsSlugField" placeholder="new-feature" />
            </div>
            <button class="button tiny primary" type="submit">
              Отправить
            </button>
            <Aside>
              <span id="docsTagsFormResult"></span>
            </Aside>
          </form>
        </Demo>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            <code>rejected.lf.tag-input</code> → <code>lf:toast</code> с понятным текстом — не
            молчаливый отказ.
          </li>
          <li>
            <code>changed.lf.tag-input</code> для автосохранения черновика и аналитики по{' '}
            <code>added</code>.
          </li>
          <li>
            <code>lf:tag-input:suggestions</code> из API по мере набора — статический список в атрибуте
            только для демо.
          </li>
        </ul>
      </Section>
    </>
  );
}
