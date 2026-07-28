import { Section, When, Demo, Code, Aside, Meta, ApiTable, c } from '../components/primitives.jsx';

export default function FormsPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={[
            'Любые формы регистрации, фильтры, настройки',
            'Кастомные checkbox/radio — брендированный UI с цветами/размерами',
            'Switch — бинарный выбор вместо чекбокса «в стиле UI»',
            'Form slider — визуальный range с handle (цена, процент)',
          ]}
        />
        <Aside>
          Для native <code>&lt;input type="range"&gt;</code> JS не нужен — form-slider это отдельный
          Foundation-подобный виджет. Нативные checkbox/radio без классов остаются браузерными.
        </Aside>
      </Section>

      <Section title="Поля">
        <Demo>
          <label>
            Input
            <input type="text" placeholder="Type here" />
          </label>
          <label>
            Select
            <select>
              <option>One</option>
              <option>Two</option>
            </select>
          </label>
          <label>
            Textarea
            <textarea rows="3"></textarea>
          </label>
          <div class="switch">
            <input class="switch-input" id="docs-switch" type="checkbox" />
            <label class="switch-paddle" for="docs-switch">
              <span class="show-for-sr">Switch</span>
            </label>
          </div>
        </Demo>
        <Code
          code={`<label>Input
  <input type="text" placeholder="Type here">
</label>

<div class="switch">
  <input class="switch-input" id="exampleSwitch" type="checkbox">
  <label class="switch-paddle" for="exampleSwitch">
    <span class="show-for-sr">Switch</span>
  </label>
</div>`}
        />
      </Section>

      <Section title="Checkbox & Radio">
        <p>
          Opt-in кастом: класс <code>.checkbox</code> / <code>.radio</code> на <code>&lt;label&gt;</code>.
          Без него инпуты остаются нативными. JS не нужен.
        </p>
        <div class="docs-note">
          <strong>Вариации (классы на label)</strong>
          <ul>
            <li>
              Цвет: <code>primary</code> (дефолт), <code>secondary</code>, <code>success</code>,{' '}
              <code>warning</code>, <code>alert</code>
            </li>
            <li>Размер: <code>tiny</code>, <code>small</code>, <code>large</code> (без класса — базовый)</li>
            <li>
              Стиль: <code>solid</code> (дефолт) или <code>hollow</code>
            </li>
          </ul>
        </div>

        <h3>Цвета и стили</h3>
        <Demo>
          <label class="checkbox primary">
            <input class="checkbox-input" type="checkbox" checked />
            <span class="checkbox-control" aria-hidden="true"></span>
            Primary solid
          </label>
          <label class="checkbox success hollow">
            <input class="checkbox-input" type="checkbox" checked />
            <span class="checkbox-control" aria-hidden="true"></span>
            Success hollow
          </label>
          <label class="checkbox warning">
            <input class="checkbox-input" type="checkbox" checked />
            <span class="checkbox-control" aria-hidden="true"></span>
            Warning
          </label>
          <label class="checkbox alert hollow">
            <input class="checkbox-input" type="checkbox" checked />
            <span class="checkbox-control" aria-hidden="true"></span>
            Alert hollow
          </label>
          <label class="checkbox secondary">
            <input class="checkbox-input" type="checkbox" checked disabled />
            <span class="checkbox-control" aria-hidden="true"></span>
            Disabled
          </label>
        </Demo>

        <h3>Размеры</h3>
        <Demo>
          <label class="checkbox primary tiny">
            <input class="checkbox-input" type="checkbox" checked />
            <span class="checkbox-control" aria-hidden="true"></span>
            Tiny
          </label>
          <label class="checkbox primary small">
            <input class="checkbox-input" type="checkbox" checked />
            <span class="checkbox-control" aria-hidden="true"></span>
            Small
          </label>
          <label class="checkbox primary">
            <input class="checkbox-input" type="checkbox" checked />
            <span class="checkbox-control" aria-hidden="true"></span>
            Default
          </label>
          <label class="checkbox primary large">
            <input class="checkbox-input" type="checkbox" checked />
            <span class="checkbox-control" aria-hidden="true"></span>
            Large
          </label>
        </Demo>

        <h3>Radio</h3>
        <Demo>
          <label class="radio primary">
            <input class="radio-input" type="radio" name="docs-plan" checked />
            <span class="radio-control" aria-hidden="true"></span>
            Primary
          </label>
          <label class="radio warning hollow">
            <input class="radio-input" type="radio" name="docs-plan" />
            <span class="radio-control" aria-hidden="true"></span>
            Warning hollow
          </label>
          <label class="radio secondary small">
            <input class="radio-input" type="radio" name="docs-plan" />
            <span class="radio-control" aria-hidden="true"></span>
            Small
          </label>
          <label class="radio success large">
            <input class="radio-input" type="radio" name="docs-plan" />
            <span class="radio-control" aria-hidden="true"></span>
            Large
          </label>
        </Demo>

        <Code
          code={`<label class="checkbox primary">
  <input class="checkbox-input" type="checkbox">
  <span class="checkbox-control" aria-hidden="true"></span>
  Remember me
</label>

<label class="radio success large hollow">
  <input class="radio-input" type="radio" name="plan">
  <span class="radio-control" aria-hidden="true"></span>
  Pro
</label>

<!-- disabled — атрибут на input, размер как у соседних -->
<label class="checkbox secondary">
  <input class="checkbox-input" type="checkbox" checked disabled>
  <span class="checkbox-control" aria-hidden="true"></span>
  Disabled
</label>`}
        />

        <h3>Настройки (SCSS)</h3>
        <p>
          Файл <code>scss/settings/forms/_choice.scss</code>. CSS-переменные:{' '}
          <code>--lf-choice-border</code>, <code>--lf-choice-bg</code>,{' '}
          <code>--lf-choice-bg-checked</code>, <code>--lf-choice-mark</code>,{' '}
          <code>--lf-choice-focus-ring</code>. Цвет акцента на вариантах — через{' '}
          <code>--lf-color-*</code>.
        </p>
      </Section>

      <Section title="Form slider">
        <p>
          Нужны <code>styles.forms</code> + <code>scripts.formSlider</code>. Разметка Foundation-shaped
          (<code>.slider[data-slider]</code>), а публичный id модуля — <code>form-slider</code>, чтобы
          не пересекаться со Swiper (<code>static id = 'swiper'</code>). Значение пишется в hidden
          input.
        </p>
        <Demo>
          <div class="slider" data-slider data-initial-start="50" data-end="100">
            <span class="slider-handle" data-slider-handle tabindex="0"></span>
            <span class="slider-fill" data-slider-fill></span>
            <input type="hidden" />
          </div>
        </Demo>
        <Code
          code={`<div class="slider" data-slider data-initial-start="50" data-end="100">
  <span class="slider-handle" data-slider-handle tabindex="0"></span>
  <span class="slider-fill" data-slider-fill></span>
  <input type="hidden">
</div>`}
        />
        <ApiTable
          columns={['Контракт', 'Имя']}
          rows={[
            ['Событие', c('changed.lf.form-slider')],
            ['Команда', c('lf:form-slider:set') + ' ' + c('{ value }')],
            ['Ready-флаг', c('data-form-slider-ready')],
          ]}
        />
        <Aside>
          Предпочитайте native <code>&lt;input type="range"&gt;</code>, если не нужна именно эта
          разметка. Карусель — отдельная страница <a href="slider.html">Slider (Swiper)</a>.
        </Aside>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Связка switch + скрытое поле: <code>name</code> на checkbox, label с{' '}
            <code>for</code> — значение уходит с формой как 0/1 или on/off.
          </li>
          <li>
            Кастомные checkbox/radio — только opt-in через класс на label; нативные контролы без
            класса остаются для простых форм и a11y-тестов.
          </li>
          <li>
            Form slider для цены/процента; длинный диапазон с прикидкой —{' '}
            <a href="slider.html">Slider (Swiper)</a> или native range, не «+» сто раз.
          </li>
        </ul>
      </Section>
    </>
  );
}
