import { mountDocs } from '../mount.jsx';
import FileUploadPage from '../pages/file-upload.jsx';

mountDocs({
  file: 'file-upload.html',
  title: 'File upload',
  kicker: 'Component',
  lead: (
    <>
      Dropzone + список файлов. Стили <code>styles.fileUpload</code>, поведение{' '}
      <code>scripts.fileUpload</code> (drag-and-drop, remove, clear).
    </>
  ),
  flags: ['styles.fileUpload', 'scripts.fileUpload'],
  Page: FileUploadPage,
});
