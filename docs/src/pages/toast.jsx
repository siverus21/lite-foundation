import { Section, When, Demo, Code, Aside, ApiTable, c } from '../components/primitives.jsx';

export default function ToastPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={[
            'Фоновое подтверждение («Сохранено», «Отправлено»), не требующее реакции',
            'Неблокирующая ошибка сети — с action-кнопкой «Повторить» в разметке',
          ]}
          bad={['Требуется решение пользователя — бери <a href="modal.html">Modal</a>']}
        />
      </Section>

      <Section title="JS API">
        <p>
          Toast управляется исключительно событиями — не нужно импортировать класс или держать ссылку
          на инстанс. Модуль сам создаёт и переиспользует <code>.toast-stack</code> при первом вызове
          и слушает <code>document</code> глобально, поэтому <code>document.dispatchEvent(...)</code>{' '}
          работает из любого места в коде (обработчик клика, <code>fetch().then()</code>, другой модуль
          и т.д.).
        </p>
        <Code
          code={`document.dispatchEvent(new CustomEvent('lf:toast:show', {
  detail: {
    title: 'Готово',       // необязательно
    message: 'Изменения сохранены',
    variant: 'success',    // primary | success | warning | alert | …любой цвет палитры
    duration: 4000,        // мс; 0 = не скрывать автоматически
    action: {               // необязательная доп. кнопка в тосте
      label: 'Открыть корзину',
      onClick: () => { location.href = '/cart'; },
      dismissOnClick: true, // false — не закрывать тост после клика по action
    },
  },
}));`}
        />
        <p>Параметры <code>detail</code>:</p>
        <ApiTable
          columns={['Поле', 'Тип', 'По умолчанию', 'Описание']}
          rows={[
            [c('title'), 'string', '—', 'Жирный заголовок; можно не указывать'],
            [c('message'), 'string', '—', 'Основной текст (например, ответ сервера)'],
            [
              c('variant'),
              'string',
              '—',
              'Цвет полосы слева: любое имя из палитры (primary, success, warning, alert…)',
            ],
            [
              c('duration'),
              'number (мс)',
              c('4000'),
              <>
                <code>0</code> — тост не скрывается сам, только по <code>[data-close]</code> или{' '}
                <code>dismiss()</code>
              </>,
            ],
            [c('action.label'), 'string', '—', 'Текст доп. кнопки внутри тоста (например «Повторить», «Открыть корзину»)'],
            [c('action.onClick'), 'function(toastEl)', '—', 'Колбэк по клику на action-кнопку'],
            [
              c('action.dismissOnClick'),
              'boolean',
              c('true'),
              <>
                <code>false</code> — тост остаётся открытым после клика (например, чтобы дать нажать
                ещё раз)
              </>,
            ],
          ]}
        />
        <ul>
          <li>
            Декларативный триггер (без единой строчки JS):{' '}
            <code>[data-toast-trigger][data-toast-variant]</code> — атрибуты{' '}
            <code>data-toast-title</code>/<code>data-toast-message</code>/
            <code>data-toast-duration</code>
          </li>
          <li>
            Закрыть руками: клик на <code>[data-close]</code> внутри тоста
          </li>
          <li>
            Одновременно на экране держится не больше 5 тостов: при всплеске уведомлений (и при
            нескольких sticky-тостах с <code>duration: 0</code>) самые старые закрываются сами, чтобы
            стек не уехал за пределы экрана
          </li>
          <li>
            <code>show(options)</code> и <code>dismiss(toastEl)</code> — методы инстанса модуля
            (используются событием <code>lf:toast:show</code> внутри; для 99% случаев события достаточно,
            инстанс не нужен)
          </li>
        </ul>
        <Demo>
          <button
            class="button"
            type="button"
            data-toast-trigger
            data-toast-variant="primary"
            data-toast-title="Инфо"
            data-toast-message="Просто уведомление"
          >
            Primary
          </button>{' '}
          <button
            class="button success"
            type="button"
            data-toast-trigger
            data-toast-variant="success"
            data-toast-title="Готово"
            data-toast-message="Изменения сохранены"
          >
            Success
          </button>{' '}
          <button
            class="button warning"
            type="button"
            data-toast-trigger
            data-toast-variant="warning"
            data-toast-title="Внимание"
            data-toast-message="Проверьте поля формы"
          >
            Warning
          </button>{' '}
          <button
            class="button alert"
            type="button"
            data-toast-trigger
            data-toast-variant="alert"
            data-toast-title="Ошибка"
            data-toast-message="Не удалось сохранить"
            data-toast-duration="0"
          >
            Alert (sticky)
          </button>
        </Demo>
        <Code
          code={`<button type="button" class="button success"
  data-toast-trigger
  data-toast-variant="success"
  data-toast-title="Готово"
  data-toast-message="Изменения сохранены">
  Success
</button>

<script>
  document.dispatchEvent(new CustomEvent('lf:toast:show', {
    detail: { title: 'Готово', message: 'Изменения сохранены', variant: 'success' },
  }));
</script>`}
        />
      </Section>

      <Section title="Пример: ответ сервера после «Добавить в корзину»">
        <p>
          Реальный сценарий из вопроса — тебе нужно вывести именно то, что вернул сервер, а не
          статичный текст. Поскольку <code>lf:toast:show</code> — обычное DOM-событие, ты просто диспатчишь
          его из своего <code>fetch().then()</code>, подставляя данные ответа в{' '}
          <code>title</code>/<code>message</code>/<code>variant</code>. Ниже — рабочая имитация запроса
          (без реального бэкенда), включая обработку ошибки и action-кнопку.
        </p>
        <Demo>
          <button class="button primary" type="button" id="docsCartAdd">
            Добавить в корзину
          </button>{' '}
          <button class="button hollow" type="button" id="docsCartAddFail">
            Добавить (симулировать ошибку)
          </button>
          <span class="docs-aside" id="docsCartCount" style={{ marginInlineStart: '0.75rem' }}>
            В корзине: 0
          </span>
        </Demo>
        <Code
          code={`async function addToCart(productId) {
  const button = document.getElementById('docsCartAdd');
  button.disabled = true;

  try {
    // Реальный код: await fetch(\`/api/cart/\${productId}\`, { method: 'POST' })
    const response = await fakeServerRequest(productId);

    document.dispatchEvent(new CustomEvent('lf:toast:show', {
      detail: {
        title: 'Добавлено в корзину',
        message: response.message,           // ← текст пришёл от "сервера"
        variant: 'success',
        action: {
          label: \`Корзина (\${response.cartCount})\`,
          onClick: () => { window.location.href = '/cart'; },
        },
      },
    }));
  } catch (error) {
    document.dispatchEvent(new CustomEvent('lf:toast:show', {
      detail: {
        title: 'Не удалось добавить',
        message: error.message,
        variant: 'alert',
        duration: 0, // ошибка — пусть висит, пока не закроют руками
        action: { label: 'Повторить', onClick: () => addToCart(productId) },
      },
    }));
  } finally {
    button.disabled = false;
  }
}`}
        />
        <Aside>
          Никакого специального API для «интеграции с сервером» не требуется — <code>lf:toast:show</code>{' '}
          уже принимает произвольный <code>title</code>/<code>message</code>/<code>variant</code>, так
          что данные из JSON-ответа сервера подставляются напрямую.
        </Aside>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Action-кнопка «Повторить» с <code>dismissOnClick: false</code> — пользователь может
            нажать снова, не теряя контекст ошибки.
          </li>
          <li>
            Sticky-тост (<code>duration: 0</code>) для критичных ошибок; success — короткий{' '}
            <code>duration</code>, чтобы не засорять экран.
          </li>
          <li>
            Централизованный обработчик на <code>document</code> для аналитики: один listener на все{' '}
            <code>lf:toast:show</code> из разных модулей.
          </li>
        </ul>
      </Section>
    </>
  );
}
