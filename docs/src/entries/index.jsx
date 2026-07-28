import { mountDocs } from '../mount.jsx';
import IndexPage from '../pages/index.jsx';

mountDocs({
  file: 'index.html',
  documentTitle: 'Документация — lite-foundation',
  title: 'lite-foundation',
  kicker: 'Документация',
  hero: true,
  lead: (
    <>
      UI-стартер в духе Foundation: Sass с cascade layers, feature-флаги, named builds и vanilla
      JS-модули. Здесь — живые демо, полный контракт атрибутов/событий и примеры для копирования.
    </>
  ),
  Page: IndexPage,
});
