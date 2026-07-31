import { Section, Demo, Code, Aside, Meta } from '../components/primitives.jsx';

function Flag({ name, kit }) {
  return (
    <Meta>
      Флаг <code>{name}</code>
      {kit ? (
        <>
          {' '}
          · <a href={kit}>ui-kit</a>
        </>
      ) : null}
    </Meta>
  );
}

export default function CssOnlyPage() {
  return (
    <>
      <Section title="Каталог">
        <p class="docs-meta">Якоря на этой странице и deep-link в UI Kit.</p>
        <ul>
          <li>
            <a href="#badge">Badge</a> / <a href="#label">Label</a>
          </li>
          <li>
            <a href="#breadcrumbs">Breadcrumbs</a> / <a href="#pagination">Pagination</a>
          </li>
          <li>
            <a href="#progress-meter">Progress &amp; Meter</a>
          </li>
          <li>
            <a href="#title-bar">Title bar</a> / <a href="#top-bar">Top bar</a>
          </li>
          <li>
            <a href="#media">Media object, Thumbnail, Embed</a>
          </li>
          <li>
            <a href="#sticky">Sticky</a>
          </li>
        </ul>
        <Aside>
          Callout/Card и Table имеют отдельные страницы (
          <a href="callout-card.html">callout-card</a>, <a href="table.html">table</a>). Tooltip с
          лёгким JS — <a href="tooltip.html">tooltip.html</a>.
        </Aside>
      </Section>

      <Section title="Badge" id="badge">
        <Flag name="styles.badge" kit="ui-kit.html#badge" />
        <Demo>
          <span class="badge">1</span>{' '}
          <span class="secondary badge">2</span>{' '}
          <span class="success badge">3</span>{' '}
          <span class="warning badge">A</span>{' '}
          <span class="alert badge">B</span>
        </Demo>
        <Code code={`<span class="badge">1</span>
<span class="success badge">3</span>`} />
      </Section>

      <Section title="Label" id="label">
        <Flag name="styles.label" kit="ui-kit.html#label" />
        <Demo>
          <span class="label">Default</span>{' '}
          <span class="primary label">Primary</span>{' '}
          <span class="success label">Success</span>{' '}
          <span class="warning label">Warning</span>{' '}
          <span class="alert label">Alert</span>
        </Demo>
        <Code code={`<span class="primary label">Primary</span>
<span class="alert label">Alert</span>`} />
      </Section>

      <Section title="Breadcrumbs" id="breadcrumbs">
        <Flag name="styles.breadcrumbs" kit="ui-kit.html#breadcrumbs" />
        <Demo>
          <nav aria-label="You are here:" role="navigation">
            <ul class="breadcrumbs">
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">Features</a>
              </li>
              <li>
                <span class="show-for-sr">Current: </span>Cloning
              </li>
            </ul>
          </nav>
        </Demo>
        <Code
          code={`<nav aria-label="You are here:" role="navigation">
  <ul class="breadcrumbs">
    <li><a href="/">Home</a></li>
    <li><span class="show-for-sr">Current: </span>Cloning</li>
  </ul>
</nav>`}
        />
      </Section>

      <Section title="Pagination" id="pagination">
        <Flag name="styles.pagination" kit="ui-kit.html#pagination" />
        <Demo>
          <ul class="pagination" role="navigation" aria-label="Pagination">
            <li class="pagination-previous disabled">
              Previous <span class="show-for-sr">page</span>
            </li>
            <li class="current">
              <span class="show-for-sr">You're on page</span> 1
            </li>
            <li>
              <a href="#" aria-label="Page 2">
                2
              </a>
            </li>
            <li class="pagination-next">
              <a href="#" aria-label="Next page">
                Next <span class="show-for-sr">page</span>
              </a>
            </li>
          </ul>
        </Demo>
        <Code
          code={`<ul class="pagination" role="navigation" aria-label="Pagination">
  <li class="pagination-previous disabled">Previous</li>
  <li class="current"><span class="show-for-sr">You're on page</span> 1</li>
  <li><a href="?page=2" aria-label="Page 2">2</a></li>
  <li class="pagination-next"><a href="?page=2" aria-label="Next page">Next</a></li>
</ul>`}
        />
      </Section>

      <Section title="Progress & Meter" id="progress-meter">
        <Flag name="styles.progress + styles.meter" kit="ui-kit.html#progress-meter" />
        <Demo>
          <div
            class="progress"
            role="progressbar"
            aria-valuenow="50"
            aria-valuemin="0"
            aria-valuemax="100"
            style={{ '--progress-value': '50%' }}
          >
            <div class="progress-meter"></div>
          </div>
          <meter value="60" min="0" low="33" high="66" optimum="80" max="100">
            60%
          </meter>
        </Demo>
        <Code
          code={`<div class="progress" role="progressbar"
  aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"
  style="--progress-value: 50%">
  <div class="progress-meter"></div>
</div>

<meter value="60" min="0" max="100">60%</meter>`}
        />
      </Section>

      <Section title="Title bar" id="title-bar">
        <Flag name="styles.titleBar" kit="ui-kit.html#title-bar" />
        <Demo>
          <div class="title-bar">
            <div class="title-bar-left">
              <button class="menu-icon" type="button" aria-label="Open menu"></button>
              <span class="title-bar-title">Title Bar</span>
            </div>
          </div>
        </Demo>
        <Code
          code={`<div class="title-bar">
  <div class="title-bar-left">
    <button class="menu-icon" type="button" aria-label="Open menu"></button>
    <span class="title-bar-title">Title Bar</span>
  </div>
</div>`}
        />
      </Section>

      <Section title="Top bar" id="top-bar">
        <Flag name="styles.topBar" kit="ui-kit.html#top-bar" />
        <Demo>
          <div class="top-bar">
            <div class="top-bar-left">
              <ul class="menu">
                <li class="menu-text">Site Title</li>
                <li>
                  <a href="#">One</a>
                </li>
              </ul>
            </div>
          </div>
        </Demo>
        <Code
          code={`<div class="top-bar">
  <div class="top-bar-left">
    <ul class="menu">
      <li class="menu-text">Site Title</li>
      <li><a href="/one">One</a></li>
    </ul>
  </div>
</div>`}
        />
      </Section>

      <Section title="Media object, Thumbnail, Embed" id="media">
        <Flag
          name="styles.mediaObject + styles.thumbnail + styles.responsiveEmbed"
          kit="ui-kit.html#media-object-thumbnail-embed"
        />
        <Demo>
          <div class="media-object">
            <div class="media-object-section">
              <div class="thumbnail">
                <img src="https://placehold.co/100x100/8a8a8a/ffffff?text=Img" alt="" />
              </div>
            </div>
            <div class="media-object-section">
              <h4>Media Object</h4>
              <p>Текст рядом с изображением.</p>
            </div>
          </div>
          <div class="responsive-embed" style={{ marginTop: '1rem' }}>
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Demo embed"
              loading="lazy"
              allowfullscreen
            ></iframe>
          </div>
        </Demo>
        <Code
          code={`<div class="media-object">
  <div class="media-object-section">
    <div class="thumbnail"><img src="…" alt=""></div>
  </div>
  <div class="media-object-section">
    <h4>Title</h4>
    <p>…</p>
  </div>
</div>

<div class="responsive-embed">
  <iframe src="…" title="…" loading="lazy" allowfullscreen></iframe>
</div>`}
        />
      </Section>

      <Section title="Sticky" id="sticky">
        <Flag name="styles.sticky" kit="ui-kit.html#sticky" />
        <Demo>
          <div class="grid-x">
            <div class="cell">
              <div class="callout primary sticky-box">
                Sticky box — держится, пока виден родительский <code>.cell</code>
              </div>
            </div>
          </div>
        </Demo>
        <Code
          code={`<div class="grid-x">
  <div class="cell">
    <div class="callout sticky-box">Pinned while parent is in view</div>
  </div>
</div>`}
        />
        <Aside>
          Для липкого заголовка таблицы см. <a href="table.html">table.html</a> (
          <code>.sticky-head</code>), не этот паттерн.
        </Aside>
      </Section>
    </>
  );
}
