import { Section, When, Demo, Code, Aside, Anatomy } from '../components/primitives.jsx';

export default function EmptyStatePage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={[
            'Пустой список заказов / избранного / результатов поиска',
            'Первый экран раздела до создания сущности',
          ]}
          bad={[
            'Ошибка загрузки — <code>callout alert</code> или card <code>.is-error</code>',
            'Загрузка — skeleton / spinner, не empty-state',
          ]}
        />
      </Section>

      <Section title="Анатомия">
        <Anatomy
          rows={[
            { part: '.empty-state', detail: 'Корень. Опционально <code>.compact</code>.' },
            { part: '.empty-state-icon', detail: 'Опциональный маркер (emoji/SVG).' },
            { part: '.empty-state-title / -text / -actions', detail: 'Заголовок, пояснение, CTA.' },
          ]}
        />
      </Section>

      <Section title="Разметка">
        <Demo>
          <div class="empty-state">
            <span class="empty-state-icon" aria-hidden="true">
              ∅
            </span>
            <h3 class="empty-state-title">Ничего не найдено</h3>
            <p class="empty-state-text">Измените фильтры или сбросьте поиск.</p>
            <div class="empty-state-actions">
              <button type="button" class="button primary">
                Сбросить фильтры
              </button>
            </div>
          </div>
        </Demo>
        <Code
          code={`<div class="empty-state">
  <span class="empty-state-icon" aria-hidden="true">∅</span>
  <h3 class="empty-state-title">Ничего не найдено</h3>
  <p class="empty-state-text">Измените фильтры или сбросьте поиск.</p>
  <div class="empty-state-actions">
    <button type="button" class="button primary">Сбросить фильтры</button>
  </div>
</div>`}
        />
        <Aside>
          Внутри card: <code>.card.is-empty</code> + compact empty-state. В таблице —{' '}
          <code>.table-shell.is-empty</code> (см. ui-kit / table recipes).
        </Aside>
      </Section>
    </>
  );
}
