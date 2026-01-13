<template>
  <div class="uploader">
    <template v-if="fileList[0]">
      <img :src="getImg(fileList[0].name, fileList[0].status)" style="width: 40px" />
    </template>

    <span
      class="fileName"
      :title="fileList[0] && fileList[0].name"
      @click="openPreview(fileInfo)"
      >{{ fileList[0] && fileList[0].name }}</span
    >
    <w-upload
      :action="action"
      :accept="accept"
      :headers="headers"
      :beforeUploa="beforeUpload"
      :file-list="fileList"
      :show-upload-list="false"
      :multiple="multiple"
      @change="changeFile"
      v-if="type !== 'preview'"
    >
      <w-button :loading="loading">
        <span>{{ fileList.length ? '重新上传' : '上传' }}</span>
      </w-button>
    </w-upload>

    <preview ref="preview"> </preview>
  </div>
</template>

<script>
import preview from './ThePreview.vue';
import { accessToken } from '@wpg/framework-vue';
import pdfIcon from '@/components/Uploader/icon/pdf.svg';
import docxIcon from '@/components/Uploader/icon/docx.svg';
import xlsIcon from '@/components/Uploader/icon/xls.svg';
import generalIcon from '@/components/Uploader/icon/general.svg';
import errorIcon from '@/components/Uploader/icon/error.svg';
import serverConfig from '@/config/server.config';
// import Preview from "../VuePreview";
// import axios from "axios";
import _ from 'lodash-es';
export default {
  name: 'Uploader',
  components: {
    preview
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    maxSize: {
      type: Number,
      default: 10
    },
    limit: {
      type: Number,
      required: false,
      default: 9
    },
    accept: {
      type: String,
      default: ['.docx', '.doc', '.pdf', '.xsl', '.xslx'].join(',')
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false
    },
    format: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss'
    },
    value: {
      type: Array,
      require: false
    },
    type: {
      type: String,
      default: 'submit'
    },
    fileInfo: {
      type: Object,
      default: undefined
    },
    confirmLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      pdfIcon,
      docxIcon,
      xlsIcon,
      generalIcon,
      errorIcon,
      config: this.$config,
      headers: {},
      loading: false,
      iconList: {},
      fileList: [],
      uid: {},
      previewBaseUrl: serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/download/',
      firstFileList: [],
      addFileList: [],
      delFileList: []
    };
  },
  computed: {
    action() {
      return serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/fileUploadNew';
    }
  },
  watch: {
    value: {
      handler() {
        this.initFileList();
      }
    },
    loading: {
      handler(val) {
        this.$emit('update:confirmLoading', val);
      }
    }
  },
  created() {
    this.headers = { Authorization: 'Bearer ' + accessToken.get() };
    this.initFileList();
  },
  activated() {
    this.initFileList();
  },
  methods: {
    initFileList() {
      const list = this.handleProcessValue();
      this.fileList = list.map(a => {
        let url = this.getFileAccessHttpUrl(a?.fileId || a?.id || '', this.previewBaseUrl);
        let fileName = this.getFileName(a?.fileName || a?.name || a.fileUrl || '');
        return {
          ...a,
          status: 'done',
          uid: this.uid[fileName] || this.uidGenerator(),
          name: fileName,
          url,
          time: a.time,
          type: a.mediaType || a.type,
          id: a.fileId || a?.id
        };
      });
      this.firstFileList = _.cloneDeep(this.fileList);
      this.addFileList = [];
      this.delFileList = [];
    },
    /**
     * 处理传入的value
     */
    handleProcessValue() {
      const value = this.value;
      let list = [];
      if (Array.isArray(value)) {
        list = value.map(i => {
          return typeof i === 'object' ? { ...i } : { url: i, name: undefined, time: undefined };
        });
      }
      return list;
    },
    beforeUpload(file, fileList) {
      if (file.size > this.maxSize * 1024 * 1024) {
        this.$message.warning(`文件大小需要小于${this.maxSize}M！`);
        return false;
      }
      const suffix = '.' + file.name.split('.').pop();
      if (!this.accept.split(',').some(i => i === suffix || i === file.type)) {
        this.$message.warning('请上传符合格式的文件!');
        const idx = fileList.findIndex(i => i.uid === file.uid);
        idx > -1 && fileList.splice(idx, 1);
        return false;
      }
    },
    changeFile(fileObj) {
      let { fileList } = fileObj;
      if (fileList.length > 1) {
        //重新上传的时候 需要删除之前的文件
        this.$emit('deletedFile', fileList[0]);
        fileList = fileList.slice(1);
      }
      this.fileList = fileList.map(file => {
        const item = { ...file };
        if (file?.response?.resultData?.uniqueId) {
          item.id = item.response.resultData.uniqueId;
          item.url = this.getFileAccessHttpUrl(
            item.response.resultData.uniqueId,
            this.previewBaseUrl
          );
          item.time = item.time
            ? this.$moment(item.time).format('YYYY-MM-DD HH:mm:ss')
            : this.$moment().format('YYYY-MM-DD HH:mm:ss');
        } else {
          item.status = item.status || 'error';
        }
        item.mediaType = item.mediaType || item.type;
        const uniqueIdDefined = file?.response?.resultData?.uniqueId !== undefined;
        const itemIdDefined = item.id !== undefined && item.id !== null;
        if ((!uniqueIdDefined || !itemIdDefined) && item.status === 'done') {
          item.status = 'error';
          item.response = file?.response?.errorMessage || '上传错误';
        }
        return item;
      });
      this.loading = this.fileList.some(i => i.status === 'uploading');
      this.handlePathChange();
    },
    getFileAccessHttpUrl(avatar, previewBaseUrl, subStr = serverConfig.PUBLIC_API_BASE_URL) {
      if (avatar?.startsWith(subStr) || avatar?.startsWith('http')) {
        return avatar;
      } else {
        return previewBaseUrl + avatar;
      }
    },
    getImg(fileName, status) {
      const type = fileName && fileName.split('.').pop();
      let fileType;
      if (status === 'error') {
        return this.errorIcon;
      }
      if (type === 'pdf') {
        fileType = this.pdfIcon;
      } else if (type === 'docx' || type === 'doc') {
        fileType = this.docxIcon;
      } else if (type === 'xls' || type === 'xlsx') {
        fileType = this.xlsIcon;
      } else {
        fileType = this.generalIcon;
      }
      return fileType;
    },
    // 回传父组件
    handlePathChange() {
      if (this.fileList.some(i => i.status === 'uploading')) {
        return;
      }
      const value = [];
      for (let i = 0; i < this.fileList.length; i++) {
        const item = { ...this.fileList[i] };
        item.mediaType = item.mediaType || item.type;
        value.push({
          type: item.mediaType || item.type,
          mediaType: item.mediaType || item.type,
          url: item.status === 'error' ? undefined : item.url,
          thumbUrl: item?.thumbUrl,
          id: item.status === 'error' ? undefined : item.id,
          status: item.status,
          response: item.status === 'error' ? item.response : null,
          name: item.name,
          ...item
        });
      }
      let add = [];
      value.forEach(a => {
        let obj = this.firstFileList.find(b => {
          return b.id === a.id;
        });
        if (!obj) {
          add.push(a);
        }
      });

      let del = [];
      this.firstFileList.forEach(a => {
        let obj = value.find(b => {
          return b.id === a.id;
        });
        if (!obj) {
          del.push(a);
        }
      });

      this.addFileList = add;
      this.delFileList = del;
      this.$emit('change', value.length ? value : undefined);
    },
    getFileName(path) {
      let p = path;
      if (p.lastIndexOf('\\') >= 0) {
        let reg = /\\\\/g;
        p = p.replace(reg, '/');
      }
      return p.substring(p.lastIndexOf('/') + 1);
    },
    uidGenerator() {
      return '-' + parseInt(Math.random() * 10000 + 1, 10);
    },

    //点击预览
    openPreview(file) {
      this.$refs['preview'].openPreview(file);
    }
  }
};
</script>

<style lang="less" scoped>
.uploader {
  display: flex;
  justify-content: space-between;
  .fileName {
    cursor: pointer;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .files {
    list-style: none;
    display: flex;
    li {
      text-align: center;
      margin-right: 15px;
      padding: 5px;
    }
    .errorFile {
    }
    .img-box {
      width: 40px;
    }
    .wpg-btn-link {
      padding: 0 3px;
    }
    .btn-box {
      display: flex;
      white-space: nowrap;
    }
    .file-name {
      line-height: 20px;
      white-space: pre-wrap;
      max-width: 168px;
      text-align: center;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      padding-top: 5px;
    }
    .file-time {
      line-height: 20px;
      font-size: 12px;
    }
    .item-box {
      display: flex;
      justify-content: center;
    }
    .wpg-btn.wpg-btn-loading:not(.wpg-btn-circle):not(.wpg-btn-circle-outline):not(.wpg-btn-icon-only) {
      padding-left: 19px;
    }
  }
}
</style>
