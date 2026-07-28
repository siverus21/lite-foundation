import { Section, When, Demo, Code } from '../components/primitives.jsx';

export default function AvatarPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={[
            'Профиль пользователя в шапке, списке комментариев, карточке команды',
            'Группа участников (<code>.avatar-group</code>) — overlap-стек',
          ]}
          bad={['Логотип бренда — обычный <code>&lt;img&gt;</code>/svg без <code>.avatar</code>']}
        />
      </Section>

      <Section title="Размеры и картинка">
        <Demo>
          <span class="avatar tiny">
            <img src="https://i.pravatar.cc/64?img=1" alt="" />
          </span>
          <span class="avatar small">
            <img src="https://i.pravatar.cc/64?img=2" alt="" />
          </span>
          <span class="avatar">
            <img src="https://i.pravatar.cc/64?img=3" alt="" />
          </span>
          <span class="avatar large">
            <img src="https://i.pravatar.cc/64?img=4" alt="" />
          </span>
        </Demo>
        <Code
          code={`<span class="avatar large">
  <img src="user.jpg" alt="">
</span>`}
        />
      </Section>

      <Section title="Инициалы (без картинки)">
        <p>
          <code>data-initials</code> + класс <code>avatar-initials</code> — рисуется через{' '}
          <code>content: attr(data-initials)</code>, без JS.
        </p>
        <Demo>
          <span class="avatar avatar-initials" data-initials="AB"></span>
          <span class="avatar avatar-initials square" data-initials="CD"></span>
        </Demo>
        <Code code={`<span class="avatar avatar-initials" data-initials="AB"></span>`} />
      </Section>

      <Section title="Статус и группа">
        <Demo>
          <span class="avatar">
            <img src="https://i.pravatar.cc/64?img=5" alt="" />
            <span class="avatar-status" data-status="online"></span>
          </span>
          <span class="avatar">
            <img src="https://i.pravatar.cc/64?img=6" alt="" />
            <span class="avatar-status" data-status="busy"></span>
          </span>
          <span class="avatar">
            <img src="https://i.pravatar.cc/64?img=7" alt="" />
            <span class="avatar-status" data-status="offline"></span>
          </span>
          <span class="avatar-group">
            <span class="avatar bordered">
              <img src="https://i.pravatar.cc/64?img=8" alt="" />
            </span>
            <span class="avatar bordered">
              <img src="https://i.pravatar.cc/64?img=9" alt="" />
            </span>
            <span class="avatar bordered avatar-initials" data-initials="+3"></span>
          </span>
        </Demo>
        <Code
          code={`<span class="avatar">
  <img src="user.jpg" alt="">
  <span class="avatar-status" data-status="online"></span>
</span>

<span class="avatar-group">
  <span class="avatar bordered"><img src="a.jpg" alt=""></span>
  <span class="avatar bordered"><img src="b.jpg" alt=""></span>
</span>`}
        />
      </Section>

      <Section title="Идеи расширения">
        <ul>
          <li>
            Статус (<code>data-status</code>) обновляйте из WebSocket/presence — CSS уже готов, JS
            только меняет атрибут.
          </li>
          <li>
            В <code>.avatar-group</code> последний элемент «+N» — тот же{' '}
            <code>avatar-initials</code>, без отдельного компонента.
          </li>
          <li>
            Для кликабельного профиля оборачивайте в <code>&lt;a&gt;</code> или{' '}
            <code>&lt;button&gt;</code> с <code>aria-label</code>, не меняя внутреннюю разметку
            аватара.
          </li>
        </ul>
      </Section>
    </>
  );
}
