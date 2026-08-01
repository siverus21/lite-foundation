import {
  Section,
  When,
  Demo,
  Code,
  Aside,
  Note,
  Anatomy,
  ApiTable,
  c,
} from '../components/primitives.jsx';

export default function ModalPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={[
            'Подтверждение опасного действия (удаление, выход без сохранения)',
            'Короткая форма поверх контекста: логин, промокод, быстрый заказ',
            'Превью / детали, когда нельзя уйти со страницы, пока диалог открыт',
          ]}
          bad={[
            'Мобильная навигация и фильтры — <a href="offcanvas.html">Off-canvas</a>',
            'Неблокирующие меню и подсказки — <a href="dropdown.html">Dropdown</a> / Tooltip',
            'Многошаговые сценарии на всю ширину экрана — отдельная страница или stepper',
          ]}
        />
      </Section>

      <Section title="Анатомия">
        <Anatomy
          rows={[
            {
              part: 'button[data-dialog-open]',
              detail: 'Триггер. Значение атрибута = <code>id</code> диалога.',
            },
            {
              part: 'dialog.modal#id',
              detail:
                'Сам диалог. Модуль при инициализации переносит его в <code>&lt;body&gt;</code>, чтобы top layer не обрезался предками с <code>transform</code>/<code>overflow</code>.',
            },
            {
              part: '.close-button[data-dialog-close]',
              detail: 'Крестик / любая кнопка закрытия внутри диалога.',
            },
            {
              part: '.modal__title',
              detail: 'Опциональный заголовок (стили типографики модалки).',
            },
          ]}
        />
      </Section>

      <Section title="Минимальная разметка">
        <Demo label="Живой пример">
          <button class="button primary" type="button" data-dialog-open="docsModal">
            Открыть dialog
          </button>
          <dialog class="modal" id="docsModal">
            <button class="close-button" type="button" data-dialog-close aria-label="Закрыть">
              <span aria-hidden="true">&times;</span>
            </button>
            <h3 class="modal__title">Native dialog</h3>
            <p>Закрытие: крестик, Esc или клик по backdrop.</p>
            <button type="button" class="button" data-dialog-close>
              Закрыть
            </button>
          </dialog>
        </Demo>
        <Code
          title="HTML"
          code={`<button type="button" class="button primary" data-dialog-open="docsModal">
  Открыть
</button>

<dialog class="modal" id="docsModal">
  <button class="close-button" type="button" data-dialog-close aria-label="Закрыть">
    <span aria-hidden="true">&times;</span>
  </button>
  <h3 class="modal__title">Заголовок</h3>
  <p>Контент</p>
  <button type="button" class="button" data-dialog-close>Закрыть</button>
</dialog>`}
        />
        <Aside>
          Флаги: <code>styles.modal</code> + <code>scripts.modal</code>. Без JS останется нативный{' '}
          <code>&lt;dialog&gt;</code>, но без scroll-lock и событий lite-foundation.
        </Aside>
      </Section>

      <Section title="Поведение модуля">
        <ul>
          <li>
            Открытие через <code>showModal()</code> — top layer, <code>::backdrop</code>, focus trap и
            Esc из коробки.
          </li>
          <li>
            На <code>&lt;body&gt;</code> вешается <code>is-modal-open</code> и блокируется скролл
            страницы.
          </li>
          <li>
            После закрытия фокус возвращается на триггер (<code>preventScroll</code>).
          </li>
          <li>
            Клик по backdrop (сама площадь <code>dialog</code> вне панели) закрывает окно.
          </li>
        </ul>
        <Note tone="warn">
          <strong>Не вкладывайте modal в modal</strong>
          Меняйте контент внутри одного <code>dialog</code> или закрывайте предыдущий перед
          открытием следующего.
        </Note>
      </Section>

      <Section title="События">
        <ApiTable
          columns={['Событие', 'Где', 'detail']}
          rows={[
            [c('opened.lf.modal'), 'на dialog', c('{ trigger }')],
            [c('closed.lf.modal'), 'на dialog', c('{ returnValue }')],
          ]}
        />
        <Code
          title="JS"
          code={`const dialog = document.getElementById('docsModal');

dialog.addEventListener('opened.lf.modal', (e) => {
  console.log('opened by', e.detail.trigger);
});

dialog.addEventListener('closed.lf.modal', (e) => {
  console.log('returnValue', e.detail.returnValue);
});`}
        />
      </Section>

      <Section title="Команды">
        <ApiTable
          columns={['Событие', 'detail', 'Эффект']}
          rows={[
            [c('lf:modal:open'), '—', 'Открыть (эквивалент showModal + scroll-lock)'],
            [c('lf:modal:close'), c('{ returnValue? }'), 'Закрыть с опциональным returnValue'],
          ]}
        />
        <Code
          title="JS"
          code={`dialog.dispatchEvent(new CustomEvent('lf:modal:open'));
dialog.dispatchEvent(new CustomEvent('lf:modal:close', {
  detail: { returnValue: 'confirm' },
}));`}
        />
      </Section>

      <Section title="Доступность">
        <ul>
          <li>
            У крестика обязателен осмысленный <code>aria-label</code> (текст «×» скрыт через{' '}
            <code>aria-hidden</code>).
          </li>
          <li>
            Заголовок лучше связать с диалогом через <code>aria-labelledby</code>, если заголовок не
            первый фокусируемый узел.
          </li>
          <li>
            Триггер — <code>&lt;button type="button"&gt;</code>, не ссылка: это действие, а не
            навигация.
          </li>
        </ul>
      </Section>

      <Section title="Confirm dialog" mark="new">
        <p>
          Узкий вариант <code>.modal.confirm</code> + ряд действий <code>.modal-actions</code>.
          Кнопка подтверждения закрывает диалог с <code>data-dialog-return</code> — значение
          попадает в <code>dialog.returnValue</code> и в <code>closed.lf.modal</code>{' '}
          (<code>detail.returnValue</code>).
        </p>
        <Demo>
          <button class="button alert hollow" type="button" data-dialog-open="docsConfirm">
            Удалить…
          </button>
          <dialog class="modal confirm" id="docsConfirm" aria-labelledby="docsConfirmTitle">
            <h3 class="modal__title" id="docsConfirmTitle">
              Удалить заказ?
            </h3>
            <p>Действие нельзя отменить.</p>
            <div class="modal-actions">
              <button type="button" class="button hollow" data-dialog-close>
                Отмена
              </button>
              <button
                type="button"
                class="button alert"
                data-dialog-close
                data-dialog-return="confirm"
              >
                Удалить
              </button>
            </div>
          </dialog>
        </Demo>
        <Code
          code={`<dialog class="modal confirm" id="confirmDelete" aria-labelledby="confirmTitle">
  <h3 class="modal__title" id="confirmTitle">Удалить заказ?</h3>
  <p>Действие нельзя отменить.</p>
  <div class="modal-actions">
    <button type="button" class="button hollow" data-dialog-close>Отмена</button>
    <button type="button" class="button alert"
      data-dialog-close data-dialog-return="confirm">Удалить</button>
  </div>
</dialog>`}
        />
        <Code
          title="JS"
          code={`dialog.addEventListener('closed.lf.modal', (e) => {
  if (e.detail.returnValue === 'confirm') {
    // вызвать API удаления
  }
});`}
        />
        <Aside>
          «Отмена» — только <code>data-dialog-close</code> (пустой returnValue). Не открывайте
          confirm из другого модала без явной очереди — нативный top layer один.
        </Aside>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            После <code>opened.lf.modal</code> сфокусируйте первое поле формы через{' '}
            <code>requestAnimationFrame</code>.
          </li>
          <li>
            Опасное действие: alert-кнопка + <code>data-dialog-return</code>, результат читайте в{' '}
            <code>closed.lf.modal</code> (см. Confirm выше).
          </li>
        </ul>
      </Section>
    </>
  );
}
