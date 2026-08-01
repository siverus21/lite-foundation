import { Section, Demo, Code, Aside, Meta } from '../components/primitives.jsx';

export default function PatternsPage() {
  return (
    <>
      <Section title="Зачем">
        <p>
          Страница фиксирует типовые экраны, чтобы не изобретать разметку заново. Все классы уже в
          kit: <code>form-control</code>, <code>button</code>, <code>card</code>,{' '}
          <code>segmented</code>, <code>input-group</code> recipes.
        </p>
      </Section>

      <Section title="Login">
        <Meta>
          Compact form + primary CTA. Password recipe опционален (
          <code>scripts.inputRecipes</code>).
        </Meta>
        <Demo>
          <form
            class="card"
            style={{ maxWidth: '22rem' }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div class="card-divider">
              <strong>Вход</strong>
            </div>
            <div class="card-section form-compact">
              <div class="form-control compact">
                <label class="form-control-label" for="loginEmail">
                  Email
                </label>
                <input id="loginEmail" type="email" class="input" autocomplete="username" />
              </div>
              <div class="form-control compact">
                <label class="form-control-label" for="loginPass">
                  Password
                </label>
                <div class="input-group password-input">
                  <input
                    id="loginPass"
                    class="input-group-field"
                    type="password"
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    class="button secondary password-input-toggle"
                    data-password-toggle
                    data-text-show="Show"
                    data-text-hide="Hide"
                    data-label-show="Show password"
                    data-label-hide="Hide password"
                    aria-pressed="false"
                    aria-label="Show password"
                  >
                    Show
                  </button>
                </div>
              </div>
              <button type="submit" class="button primary expanded">
                Войти
              </button>
            </div>
          </form>
        </Demo>
        <Code
          code={`<form class="card" style="max-width:22rem">
  <div class="card-divider"><strong>Вход</strong></div>
  <div class="card-section form-compact">
    <div class="form-control compact">…email…</div>
    <div class="form-control compact">…password-input…</div>
    <button type="submit" class="button primary expanded">Войти</button>
  </div>
</form>`}
        />
      </Section>

      <Section title="Filter bar">
        <Meta>
          Горизонтальный ряд: search recipe + segmented + primary action. На узких экранах flex
          переносит строки.
        </Meta>
        <Demo>
          <div
            class="form-compact"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.65rem',
              alignItems: 'flex-end',
            }}
          >
            <div class="form-control compact" style={{ flex: '1 1 12rem', marginBottom: 0 }}>
              <label class="form-control-label" for="filterQ">
                Поиск
              </label>
              <div class="input-group search-input">
                <span class="input-group-label search-input-icon" aria-hidden="true"></span>
                <input id="filterQ" class="input-group-field" type="search" placeholder="SKU / имя" />
                <button
                  type="button"
                  class="button clear search-input-clear"
                  data-search-clear
                  aria-label="Clear search"
                >
                  ×
                </button>
              </div>
            </div>
            <div class="form-control compact" style={{ marginBottom: 0 }}>
              <span class="form-control-label">Статус</span>
              <div class="segmented">
                <input type="radio" name="filterStatus" id="fs-all" checked />
                <label for="fs-all">Все</label>
                <input type="radio" name="filterStatus" id="fs-open" />
                <label for="fs-open">Open</label>
                <input type="radio" name="filterStatus" id="fs-done" />
                <label for="fs-done">Done</label>
              </div>
            </div>
            <button type="button" class="button primary">
              Применить
            </button>
          </div>
        </Demo>
      </Section>

      <Section title="Settings layout">
        <Meta>
          Две колонки: навигация-секции + форма. На мобиле — один столбец (grid).
        </Meta>
        <Demo>
          <div class="grid-x grid-padding-x">
            <div class="medium-4 cell">
              <ul class="vertical menu">
                <li class="menu-text">Настройки</li>
                <li>
                  <a href="#profile">Профиль</a>
                </li>
                <li>
                  <a href="#notify">Уведомления</a>
                </li>
              </ul>
            </div>
            <div class="medium-8 cell">
              <div class="card" id="profile">
                <div class="card-divider">Профиль</div>
                <div class="card-section form-compact">
                  <div class="form-control compact">
                    <label class="form-control-label" for="setName">
                      Имя
                    </label>
                    <input id="setName" type="text" class="input" />
                  </div>
                  <div class="form-control compact">
                    <label class="form-control-label" for="setLang">
                      Язык
                    </label>
                    <select id="setLang" class="input">
                      <option>Русский</option>
                      <option>English</option>
                    </select>
                  </div>
                  <button type="button" class="button primary">
                    Сохранить
                  </button>
                </div>
              </div>
              <div class="callout primary" id="notify" style={{ marginTop: '1rem' }}>
                Уведомления можно вынести во второй card с switch-контролами.
              </div>
            </div>
          </div>
        </Demo>
        <Aside>
          Для confirm опасных действий в settings —{' '}
          <a href="modal.html">modal.confirm</a> + <code>data-dialog-return</code>.
        </Aside>
      </Section>
    </>
  );
}
