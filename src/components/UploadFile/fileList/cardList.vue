<template>
  <div class="file-list">
    <div class="file__item" v-for="file in fileList" :key="file.uid">
      <div class="file">
        <div class="image-wrap">
          <img
            class="image"
            v-if="file.fileType === 'file'"
            :src="
              require('@/assets/images/default/cockpit/file-' +
                (fileSuffixList.includes(file.suffix) ? file.suffix : 'text') +
                '.png')
            "
            alt=""
          />
          <img v-if="file.fileType === 'image'" class="image" :src="file.url" />
          <div class="preview-picture">
            <w-icon
              title="预览"
              v-if="file.showFileView"
              type="eye"
              class="action"
              @click="showFile(file)"
            />
            <w-icon
              title="删除"
              v-if="!disabled"
              type="ic_delete"
              class="action"
              @click="removeFile(file)"
            />
            <w-icon
              title="下载"
              type="ic_file_download"
              class="action"
              @click="downloadFile(file)"
            />
          </div>
        </div>
        <div v-if="showName" class="name" :title="file.name">{{ file.name }}</div>
      </div>
    </div>
    <preview-dialog :zIndex="1003" ref="preview" :fileData="curFile" />
  </div>
</template>

<script>
import previewDialog from '../previewDialog.vue';
const fileSuffixList = [
'docx', 'doc', 'word', 'excel', 'xls', 'xlsx', 'text', 'txt', 'pdf', 'zip'
]
const imageSuffixList = [
        'png',
        'jpg',
        'jpeg',
        'pjp',
        'pjpeg',
        'jfif',
        'gif',
        'webp',
        'svg',
        'apng',
        'avif',
        'bmp',
        'ico',
        'cur',
        'tiff',
        'tif',
      ]
export default {
  name: 'cardList',
  components: {
    previewDialog
  },
  props: {
    fileList: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showName: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      curFile: {},
      fileSuffixList: Object.freeze(fileSuffixList),
      imageSuffixList: Object.freeze(imageSuffixList)
    };
  },
  watch: {
    fileList: {
      handler(val) {
        val?.forEach(file => {
          file.suffix = file.name?.split('.')?.pop() || 'text';
          file.fileType = this.getFileType(file.suffix);
          file.showFileView = file.fileType === 'image' || ['txt', 'pdf'].includes(file.suffix);
        });
      },
      immediate: true
    }
  },
  methods: {
    showFile(file) {
      this.curFile = file;
      this.$refs.preview && (this.$refs.preview.visible = true);
    },
    getFileType(suffix) {
      return this.imageSuffixList.includes(suffix) ? 'image' : 'file';
    },
    downloadFile(file) {
      this.$emit('downloadFile', file);
    },
    removeFile(file) {
      this.$emit('removeFile', file);
    }
  }
};
</script>
<style lang="less" scoped>
.file-list {
  width: 100%;
  display: flex;
  align-items: center;
  .file__item {
    display: flex;
    margin-right: 12px;
    align-items: center;

    .file {
      width: 94px;
      display: flex;
      flex-flow: column;
      align-items: center;
      justify-content: center;
      .image-wrap {
        position: relative;
        height: 94px;
        width: 100%;
        &:hover {
          .preview-picture {
            opacity: 1;
          }
        }
        .image {
          width: 100%;
          height: 100%;
        }
        .preview-picture {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          opacity: 0;
          color: white;
          transition: opacity 0.6s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          .action {
            cursor: pointer;
            margin-right: 6px;
            &:last-child {
              margin-right: 0;
            }
          }
        }
      }
      .name {
        text-align: center;
        width: 100%;
        padding: 8px 5px;
        line-height: 12px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
}
</style>
