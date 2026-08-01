import { Section, When, Demo, Code, Meta } from '../components/primitives.jsx';

export default function AccordionPage() {
  return (
      <>
          <Section title="Когда использовать">
              <When
                  good={[
                      'FAQ, длинные описания, «показать детали»',
                      'Когда важно, чтобы контент индексировался и работал без JS',
                  ]}
                  bad={[
                      '<a href="menus.html">Accordion menu</a> — навигация, не контентные панели',
                      '<a href="tabs.html">Tabs</a> — взаимоисключающие панели на одном уровне просмотра',
                  ]}
              />
          </Section>

          <Section title="Пример">
              <Meta>
                  По умолчанию открыта одна панель. Несколько сразу: <code>data-multi-expand="true"</code> на корне.
              </Meta>
              <Demo>
                  <div class="accordion" data-accordion>
                      <details class="accordion-item" open>
                          <summary class="accordion-title">Accordion 1</summary>
                          <div class="accordion-content">
                              <p>Panel 1 content.</p>
                          </div>
                      </details>
                      <details class="accordion-item">
                          <summary class="accordion-title">Accordion 2</summary>
                          <div class="accordion-content">
                              <p>Panel 2 content.</p>
                          </div>
                      </details>
                      <details class="accordion-item">
                          <summary class="accordion-title">Accordion 3</summary>
                          <div class="accordion-content">
                              <p>Panel 3 content.</p>
                          </div>
                      </details>
                  </div>
              </Demo>
              <Code
                  code={`<div class="accordion" data-accordion>
  <details class="accordion-item" open>
    <summary class="accordion-title">Accordion 1</summary>
    <div class="accordion-content"><p>Panel 1</p></div>
  </details>
  <details class="accordion-item">
    <summary class="accordion-title">Accordion 2</summary>
    <div class="accordion-content"><p>Panel 2</p></div>
  </details>
</div>

<!-- несколько открытых: data-multi-expand="true" -->`}
              />
          </Section>

          <Section title="Идеи расширения">
              <ul>
                  <li>
                      FAQ в SEO: контент в <code>details</code> индексируется даже при свёрнутых панелях.
                  </li>
                  <li>
                      <code>data-multi-expand="true"</code> для независимых секций; по умолчанию — одна открытая, как в
                      FAQ.
                  </li>
                  <li>
                      Якорь на <code>id</code> у <code>details</code> — deep-link на конкретный вопрос без JS.
                  </li>
              </ul>
          </Section>
      </>
  );
}
