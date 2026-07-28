import { Section, Demo, Code, Aside, ApiTable, c } from '../components/primitives.jsx';

export default function FieldExtrasPage() {
  return (
    <>
      <Section title="OTP / PIN">
        <p>
          По одной ячейке на символ, а значение живёт в одном скрытом поле. Первая ячейка получает{' '}
          <code>autocomplete="one-time-code"</code>, поэтому iOS и Android предлагают код из SMS;
          когда платформа (или вставка из буфера) отдаёт код целиком, он раскладывается по ячейкам.
        </p>
        <Demo>
          <form id="docsOtpForm">
            <label for="docsOtpFirst">Код из SMS</label>
            <div class="otp" data-otp id="docsOtp" data-otp-length="6" data-otp-name="code"></div>
            <button class="button tiny primary" type="submit">
              Подтвердить
            </button>{' '}
            <button class="button tiny secondary" type="button" data-docs-otp="clear">
              Очистить
            </button>{' '}
            <button class="button tiny secondary" type="button" data-docs-otp="fill">
              Вставить 123456
            </button>{' '}
            <button class="button tiny alert" type="button" data-docs-otp="invalid">
              Ответ: код неверный
            </button>
            <Aside>
              <span id="docsOtpStatus">Введите код или нажмите «Вставить»</span>
            </Aside>
          </form>
        </Demo>
        <Code code={`<div class="otp" data-otp data-otp-length="6" data-otp-name="code"></div>`} />
        <ApiTable
          columns={['Атрибут', 'По умолчанию', 'Что делает']}
          rows={[
            [c('data-otp-length'), c('6'), 'Число ячеек (2…12)'],
            [c('data-otp-name'), '—', <>name скрытого поля с собранным значением</>],
            [
              c('data-otp-type'),
              c('digits'),
              <>
                <code>digits</code> — только цифры и цифровая клавиатура, <code>text</code> — любые
                символы
              </>,
            ],
            [
              c('data-otp-autosubmit'),
              'выкл.',
              <>
                Отправить ближайшую форму, как только код набран — через <code>requestSubmit()</code>,
                то есть с валидацией
              </>,
            ],
          ]}
        />
        <h3>События и API</h3>
        <ApiTable
          columns={['Событие (на корне)', 'detail', 'Когда']}
          rows={[
            [c('changed.lf.otp'), c('{ value, complete }'), 'Любое изменение'],
            [c('completed.lf.otp'), c('{ value }'), 'Код набран полностью — один раз на набор'],
            [c('lf:otp:clear'), '—', 'Команда: очистить и вернуть фокус в первую ячейку'],
            [c('lf:otp:set'), c('{ value }'), 'Команда: заполнить значением'],
            [c('lf:otp:invalid'), c('{ invalid }'), 'Команда: красная рамка и подрагивание — «код не подошёл»'],
          ]}
        />
        <Code
          code={`const otp = document.getElementById('smsCode');

// Проверяем код сразу после ввода последней цифры
otp.addEventListener('completed.lf.otp', async (event) => {
  const res = await fetch('/api/verify', {
    method: 'POST',
    body: JSON.stringify({ code: event.detail.value }),
  });

  if (res.ok) {
    location.href = '/account';
  } else {
    otp.dispatchEvent(new CustomEvent('lf:otp:invalid', { detail: { invalid: true } }));
  }
});

// Кнопка «ввести другой код»
retry.addEventListener('click', () => otp.dispatchEvent(new CustomEvent('lf:otp:clear')));

// Методы инстанса
import { Otp } from 'lite-foundation/js/modules/otp.js';
const otps = new Otp(document);
otps.value(otp);          // '123456'
otps.set(otp, '123456');
otps.clear(otp);`}
        />
        <Aside>
          Метка <code>data-invalid</code> ставится на корень, а не на ячейки: неверный код — одна
          ошибка, а не шесть. Снимается автоматически при следующем изменении.
        </Aside>
      </Section>

      <Section title="Счётчик символов">
        <p>
          С <code>maxlength</code> браузер сам не даст напечатать лишнее, и счётчик — просто обратная
          связь. Без него (<code>data-char-counter-max</code>) печатать можно дальше, а счётчик
          краснеет и ставит полю <code>aria-invalid</code> — так делают соцсети, где текст важнее
          ограничения.
        </p>
        <Demo>
          <label for="docsCounterHard">
            Заголовок (жёсткий лимит, <code>maxlength</code>)
          </label>
          <input
            class="input"
            type="text"
            id="docsCounterHard"
            data-char-counter
            maxlength="60"
            placeholder="До 60 символов"
          />

          <label for="docsCounterSoft">Пост (мягкий лимит — можно превысить)</label>
          <textarea
            class="input"
            id="docsCounterSoft"
            rows="3"
            data-char-counter
            data-char-counter-max="140"
            data-char-counter-warn="0.75"
            data-char-counter-template="{count} из {max} · осталось {remaining}"
          ></textarea>
          <Aside>
            <span id="docsCounterStatus"></span>
          </Aside>
        </Demo>
        <Code
          code={`<!-- Жёсткий лимит -->
<input class="input" type="text" data-char-counter maxlength="60">

<!-- Мягкий: превышение разрешено, поле помечается невалидным -->
<textarea class="input" rows="3"
          data-char-counter
          data-char-counter-max="140"
          data-char-counter-warn="0.75"
          data-char-counter-template="{count} из {max} · осталось {remaining}"></textarea>`}
        />
        <ApiTable
          columns={['Атрибут', 'По умолчанию', 'Что делает']}
          rows={[
            [c('data-char-counter-max'), <>из <code>maxlength</code></>, <>Мягкий лимит, когда <code>maxlength</code> не задан</>],
            [c('data-char-counter-warn'), c('0.8'), 'Доля лимита, после которой счётчик желтеет'],
            [
              c('data-char-counter-template'),
              c('{count} / {max}'),
              <>Шаблон. Доступны <code>{'{count}'}</code>, <code>{'{max}'}</code>, <code>{'{remaining}'}</code></>,
            ],
          ]}
        />
        <Code
          code={`field.addEventListener('changed.lf.char-counter', (event) => {
  const { count, max, remaining, over } = event.detail;
  submitButton.disabled = over;      // не даём отправить слишком длинный текст
});`}
        />
      </Section>

      <Section title="Надёжность пароля">
        <p>
          Модуль дорисовывает <code>&lt;meter min="0" max="4"&gt;</code> и подпись. Цветовую шкалу
          рисует браузер (те же стили, что у <a href="index.html">meter</a>), а не набор классов.
        </p>
        <Demo>
          <label for="docsPassword">Пароль</label>
          <input
            class="input"
            type="password"
            id="docsPassword"
            data-password-strength
            data-password-strength-min="3"
            placeholder="Попробуйте набрать пароль"
          />
          <Aside>
            <span id="docsPasswordStatus"></span>
          </Aside>
        </Demo>
        <Code
          code={`<input class="input" type="password" data-password-strength
       data-password-strength-min="3"
       data-password-strength-labels="Слабый|Простой|Средний|Хороший|Надёжный">`}
        />
        <div class="docs-note">
          <strong>Это подсказка, а не защита</strong>
          Оценка прозрачная: длина плюс наличие строчных, заглавных, цифр и символов. Политику паролей
          всё равно проверяет сервер. <code>data-password-strength-min</code> ниже порога ставит полю{' '}
          <code>aria-invalid="true"</code> — это сигнал для вашей проверки на <code>submit</code>, а не
          нативный запрет отправки. Нужна серьёзная оценка — подключите zxcvbn: слушайте{' '}
          <code>changed.lf.password-strength</code> или переопределите{' '}
          <code>PasswordStrength.score</code>.
        </div>
        <Code
          code={`import { PasswordStrength } from 'lite-foundation/js/modules/password-strength.js';

// Своя эвристика для всех полей сразу
PasswordStrength.score = (value) => {
  const result = zxcvbn(value);
  return { score: result.score, checks: {} };
};

// Или реакция на штатную
field.addEventListener('changed.lf.password-strength', (event) => {
  const { score, label, ok, checks } = event.detail;
  hint.textContent = checks.symbol ? '' : 'Добавьте символ — станет надёжнее';
});`}
        />
      </Section>

      <Section title="Копирование в буфер">
        <p>
          <code>data-copy</code> принимает селектор: копируется <code>value</code> (для полей) или
          текст элемента. <code>data-copy-text</code> — строка как есть.
        </p>
        <Demo>
          <p>
            <code id="docsCopySnippet">npm i lite-foundation</code>{' '}
            <button class="button tiny" type="button" data-copy="#docsCopySnippet" data-copy-label="Скопировано!">
              Копировать
            </button>
          </p>
          <p>
            <input
              class="input"
              type="text"
              id="docsCopyField"
              value="LF-2026-PROMO"
              style={{ maxWidth: '14rem', display: 'inline-block' }}
            />{' '}
            <button class="button tiny secondary" type="button" data-copy="#docsCopyField" data-copy-status>
              Скопировать промокод
            </button>
          </p>
          <p>
            <button
              class="button tiny hollow"
              type="button"
              data-copy-text="https://example.com/order/1042"
              data-copy-status
              data-copy-timeout="3000"
            >
              Ссылка на заказ
            </button>
          </p>
          <Aside>
            <span id="docsCopyStatus"></span>
          </Aside>
        </Demo>
        <Code
          code={`<!-- Текст элемента; подпись кнопки временно меняется -->
<button data-copy="#snippet" data-copy-label="Скопировано!">Копировать</button>

<!-- Сообщение рядом с кнопкой вместо подмены подписи -->
<button data-copy="#promo" data-copy-status>Скопировать промокод</button>

<!-- Литеральная строка + своё время показа -->
<button data-copy-text="https://example.com" data-copy-status data-copy-timeout="3000">
  Ссылка
</button>`}
        />
        <ApiTable
          columns={['Событие (на кнопке, всплывает)', 'detail']}
          rows={[
            [c('copied.lf.copy'), c('{ text }')],
            [c('failed.lf.copy'), c('{ error }')],
          ]}
        />
        <Code
          code={`document.addEventListener('copied.lf.copy', (event) => {
  analytics.track('copy', { length: event.detail.text.length });
});

document.addEventListener('failed.lf.copy', () => {
  document.dispatchEvent(new CustomEvent('lf:toast', {
    detail: { message: 'Скопируйте вручную: буфер недоступен', variant: 'warning' },
  }));
});`}
        />
        <div class="docs-note">
          <strong>Нужен защищённый контекст</strong>
          <code>navigator.clipboard</code> доступен только по https или на localhost. На http-стенде
          модуль откатывается на скрытую <code>textarea</code> и <code>document.execCommand('copy')</code>{' '}
          — устаревший, но единственный доступный там способ. Если не вышло и это — прилетает{' '}
          <code>failed.lf.copy</code>, и сообщение показываете вы.
        </div>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            OTP: <code>completed.lf.otp</code> → verify API; при ошибке — <code>lf:otp:invalid</code> и
            фокус в первую ячейку через <code>lf:otp:clear</code>.
          </li>
          <li>
            Мягкий char-counter: блокируйте submit на <code>over: true</code> в{' '}
            <code>changed.lf.char-counter</code>.
          </li>
          <li>
            Copy: глобальный listener на <code>failed.lf.copy</code> → toast с fallback-текстом для
            http-стендов.
          </li>
        </ul>
      </Section>
    </>
  );
}
