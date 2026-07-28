import { Section, Demo, Code, Aside } from '../components/primitives.jsx';

export default function SpinnerPage() {
  return (
    <>
      <Section title="Когда использовать">
        <div class="docs-note">
          <strong>Spinner</strong> — быстрые операции (клик кнопки, отправка формы), где неизвестна
          длительность.
        </div>
        <div class="docs-note">
          <strong>Skeleton</strong> — загрузка списков/карточек: сохраняет разметку страницы
          стабильной, не даёт «прыгать» контенту (в отличие от голого spinner по центру).
        </div>
      </Section>

      <Section title="Spinner">
        <Demo>
          <span class="spinner tiny"></span>
          <span class="spinner small"></span>
          <span class="spinner"></span>
          <span class="spinner large"></span>
          <span class="spinner success"></span>
          <span class="spinner alert"></span>
          <button class="button primary" type="button" disabled>
            <span class="spinner small" style={{ verticalAlign: '-0.2em', marginInlineEnd: '0.4em' }}></span>
            Loading…
          </button>
        </Demo>
        <Code
          code={`<span class="spinner"></span>
<span class="spinner large success"></span>`}
        />
      </Section>

      <Section title="Skeleton">
        <Demo>
          <div class="flex-container flex-dir-column gap-3 docs-demo-card">
            <div class="skeleton skeleton-circle large"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
          <div class="flex-container flex-dir-column gap-3 docs-demo-card">
            <div class="skeleton skeleton-rect"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        </Demo>
        <Code
          code={`<div class="skeleton skeleton-circle large"></div>
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-text"></div>`}
        />
        <Aside>
          <code>.gap-*</code> (0–6, шаг 0.25rem) — универсальная утилита фреймворка для отступов
          между flex/grid-детьми, см. <code>scss/utilities/_flex.scss</code>.
        </Aside>
      </Section>

      <Section title="Пример: карточка профиля (skeleton → реальный контент)">
        <p>
          Главное правило skeleton-разметки: она должна повторять геометрию финальной карточки,
          иначе при подстановке данных карточка «прыгнет» — а ведь именно от этого skeleton и
          должен спасать. Надёжный способ добиться совпадения — вешать <code>.skeleton</code> не
          на пустые <code>div</code>, а <strong>на те же самые элементы</strong> (<code>h4</code>,{' '}
          <code>p</code>, с теми же классами), что и в финальной разметке, положив внутрь
          текст-заполнитель. Текст остаётся невидимым (<code>.skeleton</code> задаёт{' '}
          <code>color: transparent</code>), но задаёт элементу его настоящие <code>line-height</code>
          , <code>font-size</code> и margin'ы — высота совпадает автоматически, без подгонки на
          глаз.
        </p>
        <Demo>
          <div class="flex-container flex-dir-column align-top gap-3">
            <div class="card docs-demo-card">
              <div
                class="card-section flex-container flex-dir-column gap-3"
                id="docsSkeletonCardBody"
                aria-hidden="true"
              >
                <div class="flex-container align-middle gap-3">
                  <div class="skeleton skeleton-circle large"></div>
                  <div class="flex-child-auto">
                    <h4 class="skeleton">Имя пользователя</h4>
                    <p class="skeleton">Должность</p>
                  </div>
                </div>
                <p class="skeleton">Тут будет краткое описание профиля в таком же объёме, как и в итоге.</p>
              </div>
            </div>
            <button class="button" type="button" id="docsSkeletonToggle">
              Имитировать загрузку данных
            </button>
          </div>

          <template id="docsProfileRealContent">
            <div class="flex-container align-middle gap-3">
              <span class="avatar">
                <img src="https://i.pravatar.cc/96?img=47" alt="" />
              </span>
              <div class="flex-child-auto">
                <h4>Анна Смирнова</h4>
                <p class="docs-meta">Frontend-разработчик</p>
              </div>
            </div>
            <p>Работает над UI Kit lite-foundation, любит чистый CSS и доступность.</p>
          </template>
        </Demo>
        <Code
          code={`<!-- 1. Заглушка: те же h4/p, что и в финальной разметке, только с .skeleton
     и текстом-заполнителем. aria-hidden — заглушку не должен читать скринридер -->
<div class="card">
  <div class="card-section flex-container flex-dir-column gap-3" id="profileCard" aria-hidden="true">
    <div class="flex-container align-middle gap-3">
      <div class="skeleton skeleton-circle large"></div>
      <div class="flex-child-auto">
        <h4 class="skeleton">Имя пользователя</h4>
        <p class="skeleton">Должность</p>
      </div>
    </div>
    <p class="skeleton">Тут будет краткое описание профиля в таком же объёме, как и в итоге.</p>
  </div>
</div>

<!-- 2. Финальная разметка — один раз в HTML, а не строкой внутри JS -->
<template id="profileTemplate">
  <div class="flex-container align-middle gap-3">
    <span class="avatar"><img src="" alt=""></span>
    <div class="flex-child-auto">
      <h4></h4>
      <p class="docs-meta"></p>
    </div>
  </div>
  <p></p>
</template>

<script>
  fetch('/api/profile')
    .then((r) => r.json())
    .then((user) => {
      const card = document.getElementById('profileCard');
      const node = document.getElementById('profileTemplate').content.cloneNode(true);
      node.querySelector('img').src = user.avatarUrl;
      node.querySelector('h4').textContent = user.name;
      node.querySelector('.docs-meta').textContent = user.role;
      node.querySelector('p:last-child').textContent = user.bio;
      card.replaceChildren(node);
      card.removeAttribute('aria-hidden');
    });
</script>`}
        />
        <Aside>
          Число строк многострочного текста задаётся длиной заполнителя — поэтому в заглушке
          осмысленно держать текст примерно той же длины, что ожидается от сервера. Если разброс
          длин большой, высоту всё равно стоит зафиксировать (<code>min-height</code> или обрезка
          строк), иначе точного совпадения не добиться в принципе.
        </Aside>
        <Aside>
          Ничего специфичного для lite-foundation тут нет — <code>.skeleton</code> это просто
          CSS-класс, <code>.gap-*</code>/<code>.flex-container</code> — обычные utility-классы
          фреймворка. Кнопка выше — живая имитация: она клонирует <code>&lt;template&gt;</code> с
          задержкой ~900&nbsp;мс, как настоящий запрос.
        </Aside>
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Spinner в кнопке + <code>aria-busy</code> на форме — пара для блокировки повторной
            отправки.
          </li>
          <li>
            Skeleton на тех же тегах (<code>h4</code>, <code>p</code>), что и финальный контент —
            минимум layout shift без ручных высот.
          </li>
          <li>
            <code>prefers-reduced-motion</code> уже учтён в CSS; не добавляйте анимацию поверх
            skeleton вручную.
          </li>
        </ul>
      </Section>
    </>
  );
}
