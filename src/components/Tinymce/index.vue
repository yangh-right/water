<template>
  <textarea :id="tinymceId" style="visibility: hidden" />
</template>

<script>
/* eslint-disable no-param-reassign */
import loadTinymce from './loadTinymce';
import { plugins, toolbar } from './config';
import { debounce } from 'throttle-debounce';
import { fileUpload } from '@/api/work';
import serverConfig from '@/config/server.config';
import { convertUrl } from '@/utils/uri';

const getFileAccessHttpUrl = (avatar, subStr) => {
  if (!subStr) subStr = 'http';
  if (avatar && avatar.startsWith(subStr)) {
    return avatar;
  } else {
    return serverConfig.IMG_BASE_URL + avatar;
  }
};

let num = 1;

export default {
  props: {
    id: {
      type: String,
      default: () => {
        num === 10000 && (num = 1);
        return `tinymce${Number(new Date())}${num++}`;
      }
    },
    value: {
      default: ''
    }
  },
  data() {
    return {
      tinymceId: this.id
    };
  },
  mounted() {
    let vm = this;
    //  URL处理配置
    // http://tinymce.ax-z.cn/configure/url-handling.php
    loadTinymce(async (tinymce) => {
      await import('./zh_CN');
      let conf = {
        content_style: "div {font-size:14px; line-height: 24px;  color: #646666;} p {margin-bottom:22px;}",
        selector: `#${this.tinymceId}`,
        language: 'zh_CN',
        menubar: false,
        plugins,
        toolbar,
        height: 350,
        branding: false,
        object_resizing: false,
        end_container_on_empty_block: true,
        powerpaste_word_import: 'clean',
        code_dialog_height: 450,
        code_dialog_width: 1000,
        advlist_bullet_styles: 'square',
        advlist_number_styles: 'default',
        default_link_target: '_blank',
        link_title: false,
        convert_urls: false,
        remove_script_host: true,
        relative_urls: true,
        document_base_url: serverConfig.IMG_BASE_URL,
        nonbreaking_force_tab: true,
        fontsize_formats: '10px 11px 12px 14px 16px 18px 24px 36px 48px',
        file_picker_callback: (callback, value, meta) => {
          vm.filePicker(callback, value, meta);
        },
        urlconverter_callback: (url, elem) => {
          url = url ? convertUrl(url, 'absolute', serverConfig.IMG_BASE_URL, '') : '';

          return url;
        }
      };
      conf = Object.assign(conf, this.$attrs);
      conf.init_instance_callback = editor => {
        if (this.value) editor.setContent(this.value);
        this.vModel(editor);
        this.wordcount(editor);
      };
      tinymce.init(conf);
    });
  },
  destroyed() {
    this.destroyTinymce();
  },
  methods: {
    vModel(editor) {
      // 控制连续写入时setContent的触发频率
      const debounceSetContent = debounce(250, editor.setContent);
      this.$watch('value', (val, prevVal) => {
        if (editor && val !== prevVal && val !== editor.getContent()) {
          if (!val) val = '';
          if (typeof val !== 'string') val = val.toString();
          debounceSetContent.call(editor, val);
        }
      });

      editor.on('change keyup undo redo', () => {
        this.$emit('input', editor.getContent());
        this.$emit('change', editor.getContent());
      });
    },
    wordcount(editor) {
      let wordcount = window.tinymce.activeEditor.plugins.wordcount;
      let wordCountBtn = editor.getContainer().querySelector('button.tox-statusbar__wordcount');
      let count = wordcount.body.getCharacterCount();

      wordCountBtn.click();
      wordCountBtn.innerHTML = `${count} 个字符`;
    },
    destroyTinymce() {
      if (!window.tinymce) return;
      const tinymce = window.tinymce.get(this.tinymceId);
      if (tinymce) {
        tinymce.destroy();
      }
    },
    /* 附件上传 */
    filePicker(callback, value, meta) {
      let filetype =
        '.pdf, .txt, .zip, .rar, .7z, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .mp3, .mp4';
      switch (meta.filetype) {
        case 'image':
          filetype = '.jpg, .jpeg, .png, .gif';
          break;
        case 'media':
          filetype = '.mp3, .mp4';
          break;
        case 'file':
        default:
      }
      let input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', filetype);
      input.click();
      input.onchange = function() {
        let file = this.files[0];
        let extra = {
          title: file.name
        };
        let formData = new FormData();
        formData.append('file', file);

        if (meta.filetype === 'image') {
          extra.alt = file.name;
        } else if (meta.filetype === 'file') {
          extra.text = file.name;
        } else {
          extra.text = file.name;
        }

        extra.title = file.name;

        fileUpload(formData)
          .then(res => {
            if (res.resultData.url) {
              let url = getFileAccessHttpUrl(res.resultData.url);
              callback(url, extra);
            } else {
              this.$message.error(res.errorMsg || '上传失败');
            }
          })
          .catch(err => {
            console.log(err);
          });

        // let file = this.files[0];
        // let reader = new FileReader();
        // reader.onload = function() {
        //   let suffix = file.name.split('.').pop();
        //   let data = {
        //     endWith: suffix,
        //     fileType: suffix,
        //     imageString: reader.result,
        //     pictureRealName: file.name,
        //     returnFlag: true
        //   };
        //   uploadPicture(data).then(res => {
        //     console.log(res);
        //     const { status, resultData } = res;
        //     if (status === 'complete') {
        //       callback(resultData, { title: file.name });
        //     } else {
        //       this.$message.error(res.errorMessage);
        //     }
        //   });
        // };
        // reader.readAsDataURL(file);
      };
    }
  }
};
</script>
