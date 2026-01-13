<template>
  <w-modal
    :title="title"
    :visible="visible"
    :destroyOnClose="true"
    class="upload-modal secondary-modal"
    centered
    :maskClosable="false"
    @cancel="handleCancel"
    :width="650"
  >
    <template slot="footer">
      <w-button
        type="primary"
        :disabled="fileList.length === 0"
        :loading="uploading"
        style="margin-top: 16px"
        @click="handleUpload"
      >
        {{ uploading ? '上传中' : '上传' }}
      </w-button>
    </template>
    <w-upload-dragger
      name="file"
      :multiple="false"
      :file-list="fileList"
      :accept="supportType"
      :before-upload="handleBeforeUpload"
      :remove="handleRemoveFile"
      @reject="filterJsonFile"
      @change="handleChange"
    >
      <div class="wpg-upload-drag-trigger">
        <w-icon type="ic_unarchive" class="wpg-upload-drag-trigger-icon" />
        <span class="wpg-upload-drag-trigger-title">选择或拖拽文件至此上传</span
        ><span class="wpg-upload-drag-trigger-description">每次只能进行单个文件的上传</span>
      </div>
    </w-upload-dragger>
    <p class="tip" v-if="showTemplateBtn">
      <w-icon type="ic_get_app" /><span @click="downloadTemp">
        下载导入模板
      </span>
    </p>
  </w-modal>
</template>

<script>
import { saveAs } from 'file-saver';
export default {
  props: {
    showTemplateBtn: {
      type: Boolean,
      default: false
    },
    importMeth: {
      type: Function,
      default: null
    },
    supportType: {
      type: String,
      default: '.xls,.xlsx'
    },
    title: {
      type: String,
      default: '文件上传'
    },
    rejectTip: {
      type: String,
      default: '请选择Excel文件进行上传'
    }
  },
  data() {
    return {
      visible: false,
      resultShow: false,
      resultData: undefined,
      fileList: [],
      uploading: false,
      // 支持的格式，json
      flag: false,
      resultTitle: undefined
    };
  },
  computed: {},
  methods: {
    handleCancel() {
      this.visible = false;
      this.resetFileList();
    },
    filterJsonFile(fileList) {
      this.$message.error(this.rejectTip);
      fileList.forEach(file => this.handleRemoveFile(file));
    },
    async handleUpload() {
      this.resultData = undefined;
      const { fileList } = this;

      if (!this.importMeth) {
        this.resetFileList();
        this.handleCancel();
        return;
      }
      this.uploading = true;
      this.importMeth(fileList, res => {
        if (res.status) {
          this.resetFileList();
          this.handleCancel();
        } else {
          this.$confirm({
            title: '导入失败，是否下载错误信息文档？',
            content: '',
            okText: '确认',
            okType: 'warning',
            icon: 'exclamation-circle',
            cancelText: '取消',
            closable: true,
            async onOk() {
              saveAs(res.data, '导入错误信息');
            }
          });
        }
        this.uploading = false;
      });
    },
    handleBeforeUpload(file) {
      this.fileList = [...this.fileList, file];
      return false;
    },
    showResultModal() {},
    handleRemoveFile(file) {
      const index = this.fileList.indexOf(file);
      if (index > -1) {
        const newFileList = this.fileList.slice();
        newFileList.splice(index, 1);
        this.fileList = newFileList;
      }
    },
    resetFileList() {
      this.fileList = [];
    },
    handleChange({ file }) {
      if (this.fileList.length > 1) {
        this.handleRemoveFile(file);
        this.$message.error('文件上传数超过最大限制');
      }
    },
    isJson(value) {
      const pattern = /(.json)$/g;
      return pattern.test(value);
    },
    isExcel(value) {
      const pattern = /^.*\.(?:xls|xlsx)$/;
      return pattern.test(value);
    },
    downloadTemp() {
      this.$emit('download');
    }
  }
};
</script>
<style lang="less" scoped>
.upload-modal {
  /deep/ .wpg-modal-body {
    padding-top: 32px;
  }
  .tip {
    color: var(--supply-color-primary-DEFAULT);
    cursor: pointer;
    margin-top: 12px;
  }
}
</style>
