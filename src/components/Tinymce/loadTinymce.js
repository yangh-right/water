import loadScript from './loadScript';

const staticPath = `${process.env.BASE_URL}`;
export default function loadTinymce(cb) {
  if (window.tinymce) {
    cb(window.tinymce);
    return;
  }
  loadScript(`${staticPath}tinymce/tinymce.min.js`, () => {
    // eslint-disable-next-line no-undef
    // tinymceObj = tinymce;
    cb(window.tinymce);
  });
}
