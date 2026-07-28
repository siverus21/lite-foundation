import { Section, Demo, Code } from '../components/primitives.jsx';

export default function CalloutCardPage() {
  return (
    <>
      <Section title="Когда использовать">
        <div class="docs-note">
          <strong>Callout</strong> — инлайн-уведомление: успех формы, предупреждение, подсказка в
          потоке текста. Не заменяет toast/snackbar и не блокирует UI (это не modal).
        </div>
        <div class="docs-note">
          <strong>Card</strong> — единица списка: товар, статья, человек в команде. Внутри —
          divider / section; сетку даёт layout (<code>grid-x</code>), не сам card.
        </div>
      </Section>

      <Section title="Callout">
        <Demo>
          <div class="callout primary">
            <p>Primary callout</p>
          </div>
          <div class="callout secondary">
            <p>Secondary</p>
          </div>
          <div class="callout success">
            <p>Success</p>
          </div>
          <div class="callout warning">
            <p>Warning</p>
          </div>
          <div class="callout alert">
            <p>Alert</p>
          </div>
        </Demo>
        <Code
          code={`<div class="callout primary"><p>Primary callout</p></div>
<div class="callout alert"><p>Something went wrong</p></div>`}
        />
      </Section>

      <Section title="Закрываемый callout">
        <p>
          Нужен флаг <code>scripts.dismiss</code>. Кнопка <code>[data-close]</code> удаляет
          ближайший <code>[data-closable]</code> или <code>.callout</code>.
        </p>
        <Demo>
          <div class="callout warning" data-closable>
            <button class="close-button" type="button" data-close aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <p>Можно закрыть крестиком.</p>
          </div>
        </Demo>
        <Code
          code={`<div class="callout warning" data-closable>
  <button class="close-button" type="button" data-close aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
  <p>Можно закрыть крестиком.</p>
</div>`}
        />
      </Section>

      <Section title="Card">
        <Demo>
          <div class="grid-x grid-margin-x">
            <div class="cell medium-6">
              <div class="card">
                <div class="card-divider">Header</div>
                <div class="card-section">
                  <h4>Card title</h4>
                  <p>Card body text.</p>
                </div>
              </div>
            </div>
          </div>
        </Demo>
        <Code
          code={`<div class="card">
  <div class="card-divider">Header</div>
  <div class="card-section">
    <h4>Card title</h4>
    <p>Card body text.</p>
  </div>
</div>`}
        />
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Callout после отправки формы — inline; глобальные уведомления —{' '}
            <a href="toast.html">Toast</a>.
          </li>
          <li>
            Закрываемый callout: тот же <code>lf:dismiss</code>, что у{' '}
            <a href="chip.html">Chip</a> — можно отменить удаление через{' '}
            <code>preventDefault()</code>.
          </li>
          <li>
            Карточки в сетке <code>grid-x</code>; не задавайте ширину на самом <code>.card</code>.
          </li>
        </ul>
      </Section>
    </>
  );
}
