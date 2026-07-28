import { Section, When, Demo, Code, Aside, ApiTable, c } from '../components/primitives.jsx';

export default function ChipPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={['Активные фильтры, выбранные значения, категории/теги статьи']}
          bad={[
            'Статус сущности (заказ/платёж) — бери <a href="ui-kit.html#badge">Badge/Label</a>',
          ]}
        />
      </Section>

      <Section title="Палитра, hollow, размеры">
        <Demo>
          <span class="chip">Default</span>
          <span class="chip primary">Primary</span>
          <span class="chip success">Success</span>
          <span class="chip warning">Warning</span>
          <span class="chip alert">Alert</span>
          <span class="chip primary hollow">Hollow</span>
          <span class="chip small">Small</span>
          <span class="chip large">Large</span>
        </Demo>
        <Code
          code={`<span class="chip primary">Primary</span>
<span class="chip primary hollow">Hollow</span>`}
        />
      </Section>

      <Section title="Удаляемый чип">
        <p>
          Нужен флаг <code>scripts.dismiss</code>. Кнопка <code>.chip-close[data-close]</code>{' '}
          удаляет ближайший <code>[data-closable]</code>.
        </p>
        <Demo>
          <span class="chip primary" data-closable>
            React
            <button class="chip-close" type="button" data-close aria-label="Remove"></button>
          </span>
          <span class="chip" data-closable>
            Vue
            <button class="chip-close" type="button" data-close aria-label="Remove"></button>
          </span>
        </Demo>
        <Code
          code={`<span class="chip primary" data-closable>
  React
  <button class="chip-close" type="button" data-close aria-label="Remove"></button>
</span>`}
        />
      </Section>

      <Section title="JS API: событие lf:dismiss (в том числе отмена удаления)">
        <p>
          При клике на <code>[data-close]</code> модуль <code>Dismiss</code> сначала диспатчит
          отменяемое (<code>cancelable</code>) событие <code>lf:dismiss</code> на самом чипе (
          <code>[data-closable]</code>) и только потом удаляет элемент из DOM. Это работает
          одинаково для чипов, callout и любых других <code>[data-closable]</code>-блоков.
        </p>
        <ApiTable
          columns={['Событие', 'detail', 'Поведение']}
          rows={[
            [
              c('lf:dismiss'),
              `${c('{ trigger }')} — кнопка ${c('[data-close]')}, по которой кликнули`,
              'По умолчанию элемент удаляется сразу после события',
            ],
          ]}
        />
        <Code
          code={`// Просто узнать, что тег удалили (например, чтобы синхронизировать состояние формы)
chipEl.addEventListener('lf:dismiss', (event) => {
  console.log('Удалили:', event.detail.trigger);
});

// Гибкий сценарий: подтвердить удаление на сервере, прежде чем убрать чип из DOM
chipEl.addEventListener('lf:dismiss', (event) => {
  event.preventDefault(); // остановить автоматическое удаление
  chipEl.classList.add('is-removing');

  fetch(\`/api/tags/\${chipEl.dataset.tagId}\`, { method: 'DELETE' })
    .then(() => chipEl.remove())
    .catch(() => {
      chipEl.classList.remove('is-removing');
      document.dispatchEvent(new CustomEvent('lf:toast', {
        detail: { title: 'Не удалось удалить тег', variant: 'alert' },
      }));
    });
});`}
        />
        <p>Живой пример: удаление подтверждается «сервером» с задержкой ~600&nbsp;мс.</p>
        <Demo>
          <span class="chip primary" data-closable id="docsDismissChip">
            Тег на сервере
            <button class="chip-close" type="button" data-close aria-label="Remove"></button>
          </span>
          <span class="docs-aside" id="docsDismissStatus" style={{ marginInlineStart: '0.5rem' }}></span>
        </Demo>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            <code>event.preventDefault()</code> на <code>lf:dismiss</code> + повторный{' '}
            <code>remove()</code> после API — паттерн для «мягкого» удаления тегов.
          </li>
          <li>
            Список активных фильтров: рендерите чипы из массива, <code>data-tag-id</code> на корне
            для синхронизации с бэкендом.
          </li>
          <li>
            Hollow-чипы для вторичных тегов; заливка — для выбранных/важных значений.
          </li>
        </ul>
      </Section>
    </>
  );
}
