<template>
  <div class="vc-file-upload">
    <template v-if="detailType === 'showUpload'">
      <component
        :is="`w-` + type"
        name="multipartFile"
        :file-list="fileList"
        :headers="headers"
        :disabled="disabled"
        :multiple="multiple"
        :action="action || defaultApi"
        :accept="accept"
        :remove="remove"
        :before-upload="beforeUpload"
        v-bind="attrs"
        :showUploadList="showUploadList"
        @preview="handlePreview"
        v-on="listeners"
        @change="handleUploadChange($event)"
      >
        <slot name="content">
          <w-button v-if="type === 'upload'" :loading="loading" class="upload-btn">
            <w-icon type="upload" /> {{ buttonText }}
          </w-button>
          <div v-else>
            <p class="wpg-upload-drag-icon">
              <w-icon type="inbox" />
            </p>
            <p class="wpg-upload-text">选择或拖拽文件至此上传</p>
            <p class="wpg-upload-hint">每次只能进行单个文件的上传</p>
          </div>
        </slot>
      </component>
      <p v-show="showInfo" class="vc-file-upload-tip wfc3">{{ info }}</p>
    </template>
    <ul v-else class="file-list-info">
      <li v-for="file in fileList" :key="file.id">
        <w-icon :component="isPdf(file) ? pdfIcon : fileIcon" class="icon" />
        <span class="ellipsis wfc2 name" :title="file.name">
          {{ file.name }}
        </span>
        <span class="operate-btn">
          <w-button
            type="link"
            :loading="loading"
            class="download wfc-theme"
            @click="handleDownload(file)"
            >下载</w-button
          >
          <!-- <template v-if="isPdf(file)"> -->
          <w-divider type="vertical"></w-divider>
          <w-button
            type="link"
            :loading="loading"
            class="preview wfc-theme"
            @click="handlePreview(file)"
            >预览</w-button
          >
          <!-- </template> -->
        </span>
      </li>
    </ul>
    <preview ref="preview" />
  </div>
</template>

<script>
import { ACCESS_TOKEN, USER_INFO } from '@/store/mutation-types';
import storage from '@/utils/storage';
import dayjs from 'dayjs';
import { uidGenerator, getFileName, getFileAccessHttpUrl } from './util';
// import axios from 'axios';
import pdfIcon from './icon/pdf.svg?inline';
import fileIcon from './icon/file.svg?inline';
import serverConfig from '@/config/server.config';
import Preview from '../VuePreview';

export default {
  name: 'AVcFileUpload',
  components: { Preview },
  model: {
    prop: 'value',
    event: 'change'
  },

  props: {
    type: {
      type: String,
      default: 'upload'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    detailType: {
      type: String,
      default: 'showUpload'
    },
    tip: {
      type: String,
      default: ''
    },
    accept: {
      type: String,
      default: ['.docx', '.doc', '.pdf', '.xls', '.xlsx'].join(',')
    },
    action: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: '点击上传'
    },
    buttonText: {
      type: String,
      default: '点击上传'
    },
    value: {
      type: [String, Array],
      require: false
    },
    maxSize: {
      type: Number,
      default: 10
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false
    },
    limit: {
      type: [Number, String],
      required: false,
      default: 9
    },
    previewBaseUrl: {
      type: String,
      default: `${serverConfig.API_BASE_URL}/waterwork-sys-api/FileManagerFun/download/`
    },
    showUploadList: {
      type: Object,
      default: () => ({
        showRemoveIcon: true
      })
    },
    remove: {},
    attrs: {},
    extraParams: {},
    listeners: {},
    showInfo: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      uid: {},
      headers: {},
      fileList: [],
      loading: false
    };
  },
  computed: {
    info() {
      return `支持${this.accept}文件${this.accept.split[','] > 1 ? '等' : ''}, 可上传${
        this.limit
      }个文件,单个文件大小不超过${this.maxSize}M`;
    },
    defaultApi() {
      let api = `${serverConfig.API_BASE_URL}/waterwork-device-api/DeviceInstance/saveFile`;
      if (this.attrs?.listType === 'picture-card' || this.attrs?.listType === 'picture') {
        api += '?storeType=0';
      } else {
        api += '?storeType=1';
      }
      return api;
    }
  },
  watch: {
    value(val) {
      if (Array.isArray(val)) {
        // if (val.length !== this.fileList.length) {
        this.initFileList();
        // }
      }
    }
  },
  beforeCreate() {
    this.pdfIcon = pdfIcon;
    this.fileIcon = fileIcon;
  },
  created() {
    const token = storage.get(ACCESS_TOKEN);
    this.headers = { Authorization: `Bearer ${token}`, tenantId: storage.get(USER_INFO)?.tenantId };
    this.initFileList();
  },

  methods: {
    // 显示已有文件
    initFileList() {
      const paths = this.handleProcessValue();

      this.fileList = paths.map(file => {
        let url = getFileAccessHttpUrl(file?.id || file.uid || '', this.previewBaseUrl);
        let fileName = getFileName(file?.name || file.url || '');
        return {
          uid: this.uid[fileName] || uidGenerator(),
          name: fileName,
          status: 'done',
          ...file,
          url,
          thumbUrl: url
        };
      });
    },
    /**
     * 处理传入的value
     */
    handleProcessValue() {
      /**
       * value 可能的格式
       *
       * 1. 'url'
       *
       * 2. ['url', 'url']
       *
       * 上面默认都是图片的url
       *
       * 3. [
       *  {name: '1', url: '', type: },
       *  {name: '2', url: '', type:}
       * ]
       */
      const value = this.value;
      let list = [];
      if (typeof value === 'string') {
        list = value.split(',').map(i => ({ name: undefined, url: i, uploadTime: undefined }));
      } else if (Array.isArray(value)) {
        list = value.map(i => {
          return typeof i === 'object'
            ? { ...i }
            : { url: i, name: undefined, uploadTime: undefined };
        });
      }

      return list;
    },

    beforeUpload(file, fileList) {
      if (file.size > this.maxSize * 1024 * 1024) {
        this.$message.warning(`文件大小需要小于${this.maxSize}M！`);
        return false;
      }
      if (this.fileList.length + 1 > this.limit) {
        // 当只能传一个文件时，使用替代逻辑
        this.$message.warning(`最多上传${this.limit}个文件`);
        return false;
      }

      // 图片上传
      if (this.attrs?.listType === 'picture-card') {
        let fileType = file.type;
        if (fileType.indexOf('image') < 0 && fileType.indexOf('video') < 0) {
          this.$message.warning('请上传图片/视频！');
          return false;
        }
      } else {
        // 文件上传
        const suffix = '.' + file.name.split('.').pop();
        if (!this.accept.split(',').some(i => i === suffix || i === file.type)) {
          this.$message.warning('请上传符合格式的文件!');
          const idx = fileList.findIndex(i => i.uid === file.uid);
          idx > -1 && fileList.splice(idx, 1);
          return false;
        }
      }
      let patrn = /[`~!@#$%^&*()\\+=<>?:"{}|,\\/;'\\[\]~！@#￥%……&*（）——\\+={}|《》？：“”【】、；‘'，。、]/im;
      if (patrn.test(file.name)) {
        this.$message.warning('文件名称格式错误，仅允许下划线，中划线，点三个特殊字符');
        fileList.pop();
        return false;
      }
    },
    checkFileLimit(fileList) {
      if (fileList.length > this.limit) {
        // 当只能传一个文件时，使用替代逻辑
        if (this.limit === 1) {
          this.$confirm({
            title: '确定此操作?',
            content: '已有文件，是否覆盖',
            onOk: async () => {
              if (fileList.length > this.limit) {
                fileList.shift();
              }
              this.updateFileList(fileList);
            },
            onCancel: () => {
              fileList.pop();
              this.updateFileList(fileList);
            }
          });
        } else {
          this.$message.warning(`最多上传${this.limit}个文件`);
          this.$emit('overLimit', fileList, this.updateFileList);
          // return false;
        }
      } else {
        this.updateFileList(fileList);
      }
    },
    updateFileList(fileList, accept = true) {
      this.fileList = fileList.map(file => {
        const item = { ...file };
        if (file?.response?.resultData && file?.response.status === 'complete') {
          item.id = item.response.resultData;
          item.url = getFileAccessHttpUrl(item.response.resultData, this.previewBaseUrl);
          item.uploadTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
        } else {
          item.status = item.status || 'error';
        }
        item.mediaType = item.mediaType || item.type;
        // if (file.percent === 100 && !file.response) {
        //   item.status = 'error';
        //   item.response = '上传错误';
        // }
        return item;
      });
      return accept;
    },

    // 图片上传回调
    handleUploadChange(info) {
      if (info.file && info.file.status === 'done' && info.file.response.status === 'error') {
        let errorMessage = info.file.response?.errorMessage || '上传错误';
        this.$message.warning(errorMessage);
        this.fileList = this.fileList.filter(
          item => !(item.status === 'done' && item.response && item.response.status === 'error')
        );
        return;
      }
      let fileList = [...info.fileList];
      if (fileList.length > this.limit) {
        fileList = fileList.slice(0, this.limit);
        this.$message.warning(`最多上传${this.limit}个文件`);
        return;
      }
      this.updateFileList(fileList);
      this.loading = this.fileList.some(i => i.status === 'uploading');
      this.handlePathChange();
    },
    // 回传父组件
    handlePathChange() {
      if (this.fileList.some(i => i.status === 'uploading')) {
        return;
      }
      this.$emit('change', this.fileList);
    },

    async handleDownload(file) {
      if (file.url) {
        window.location.href = file.url;
        // try {
        //   this.loading = true;
        //   const { data } = await axios({
        //     method: 'get',
        //     url: file.url,
        //     responseType: 'blob'
        //   });
        //   const blob = new Blob([data]);
        //   let elink = document.createElement('a');
        //   elink.download = file.name || 'filename';
        //   elink.style.display = 'none';
        //   let href = window.URL.createObjectURL(blob);
        //   elink.href = href;
        //   document.body.appendChild(elink);
        //   elink.click();
        //   document.body.removeChild(elink);
        //   window.URL.revokeObjectURL(href); // 释放掉blob对象
        // } catch (error) {
        //   console.log(error);
        // } finally {
        //   this.loading = false;
        // }
      }
    },
    isPdf(file) {
      return file?.type && file?.type.includes('pdf');
    },
    handlePreview(file) {
      this.$refs['preview'].getPreViewUrl(file.name || '.png', file.id || file.uid);
    },
    customPreview() {},
    // 删除
    handleDelete(file) {
      console.log(file);
      this.handlePathChange();
    }
  }
};
</script>

<style lang="less" scoped>
.vc-file-upload {
  &-tip {
    margin-top: 5px;
    font-size: 12px;
    line-height: 1.5;
  }

  /deep/ .wpg-upload {
    &-list-item-error {
      a {
        color: #f5222d;
      }

      .wpg-upload-list-item-info .anticon {
        top: 3px;
        color: #f5222d;
      }
    }

    .upload-btn {
      height: 32px;
      padding: 0 8px;
    }
  }

  .file-list-info {
    display: grid;
    grid-auto-rows: minmax(20px, auto);
    grid-gap: 11px 108px;
    grid-template-columns: repeat(auto-fill, minmax(269px, 1fr));

    > li {
      display: flex;
      align-items: center;
      // height: 25px;
      height: auto;

      .icon {
        font-size: 25px;
      }

      .name {
        display: inline-block;
        flex: 1;
        margin-left: 10px;
      }

      .operate-btn {
        margin-left: 5px;
        white-space: nowrap;

        .wpg-divider {
          margin: 0;
        }

        .download,
        .preview {
          height: 22px;
          padding: 0 8px;
        }
      }
    }
  }
  /deep/ .wpg-modal {
    width: 400px;
    height: 500px;
  }
}
</style>
