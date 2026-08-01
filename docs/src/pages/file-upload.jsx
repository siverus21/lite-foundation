import { Section, When, Demo, Code, Aside, ApiTable, c } from '../components/primitives.jsx';

export default function FileUploadPage() {
  return (
    <>
      <Section title="Когда использовать">
        <When
          good={['Вложения к заявке, аватар/документ, импорт CSV']}
          bad={['Один скрытый file input без dropzone — нативный label достаточно']}
        />
      </Section>

      <Section title="Разметка">
        <Demo>
          <div class="file-upload" data-file-upload style={{ maxWidth: '28rem' }}>
            <input class="file-upload-input" type="file" id="docsUpload" multiple />
            <label class="file-upload-drop" for="docsUpload">
              <span class="file-upload-title">Перетащите файлы сюда</span>
              <span class="file-upload-hint">или нажмите, чтобы выбрать</span>
            </label>
            <ul class="file-upload-list" data-file-upload-list></ul>
          </div>
        </Demo>
        <Code
          code={`<div class="file-upload" data-file-upload>
  <input class="file-upload-input" type="file" id="up" multiple>
  <label class="file-upload-drop" for="up">
    <span class="file-upload-title">Перетащите файлы сюда</span>
    <span class="file-upload-hint">или нажмите, чтобы выбрать</span>
  </label>
  <ul class="file-upload-list" data-file-upload-list></ul>
</div>`}
        />
      </Section>

      <Section title="События и команды">
        <ApiTable
          columns={['Имя', 'Где', 'detail']}
          rows={[
            [c('changed.lf.file-upload'), 'на корне', c('{ files: File[] }')],
            [c('lf:file-upload:clear'), 'на корне', 'Очистить выбор'],
          ]}
        />
        <Code
          title="JS"
          code={`const root = document.querySelector('[data-file-upload]');
root.addEventListener('changed.lf.file-upload', (e) => {
  console.log(e.detail.files);
});
root.dispatchEvent(new CustomEvent('lf:file-upload:clear'));`}
        />
        <Aside>
          После drop модуль пытается синхронизировать <code>input.files</code> через{' '}
          <code>DataTransfer</code>. На старых движках список UI обновляется, а нативный input может
          остаться пустым — для отправки на сервер слушайте <code>changed</code> и кладите{' '}
          <code>File</code> в свой <code>FormData</code>.
        </Aside>
      </Section>
    </>
  );
}
