<template>
  <div class="uploader">
    <w-upload
      :action="action"
      :accept="accept"
      :headers="headers"
      :beforeUpload="beforeUpload"
      :file-list="fileList"
      :show-upload-list="false"
      :multiple="multiple"
      @change="changeFile"
      v-if="type !== 'preview'"
    >
      <w-button :loading="loading"> <w-icon type="upload" /> 上传 </w-button>
      <div v-show="fileList.length === 0" style="margin-top: 10px">
        支持.doc、docx、pdf文件，可上传{{ limit }}个文件，单个文件大小不超过50M
      </div>
    </w-upload>
    <div>
      <ul class="files">
        <li
          v-for="item in fileList"
          :key="item.uid"
          v-loading="item.status === 'uploading'"
          :class="item.status === 'error' ? 'errorFile' : ''"
        >
          <w-tooltip placement="top">
            <template slot="title">
              <span v-if="item.status === 'error'">{{ item.response }}</span>
            </template>
            <img :src="getImg(item.name, item.status)" class="img-box" />
            <div class="file-name" :title="item.name">{{ item.name }}</div>
            <div class="item-box">
              <div class="btn-box">
                <w-button type="link" :disabled="item.status === 'error'" @click="preview(item)"
                  >预览</w-button
                >
                <w-button
                  type="link"
                  :disabled="item.status === 'error'"
                  @click="downloadFile(item)"
                  >下载</w-button
                >
                <w-button type="link" v-if="type !== 'preview'" @click="deleteFile(item)"
                  >删除</w-button
                >
              </div>
            </div>
            <div class="file-time">
              {{ item.createTime ? $moment(item.createTime).format(format) : '--' }}
            </div>
          </w-tooltip>
        </li>
      </ul>
    </div>
    <preview ref="preview" :showModel="true" />
  </div>
</template>
<script>
import { accessToken } from '@wpg/framework-vue';
import pdfIcon from './icon/pdf.svg';
import docxIcon from './icon/docx.svg';
import xlsIcon from './icon/xls.svg';
import generalIcon from './icon/general.svg';
import errorIcon from './icon/error.svg';
import Preview from '../VuePreview';
import axios from 'axios';
import _ from 'lodash-es';
import serverConfig from '@/config/server.config';
export default {
  name: 'Uploader',
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
      default: ['.docx', '.doc', '.pdf', '.xsl', '.xlsx'].join(',')
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
    }
  },
  components: { Preview },
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
      delFileList: [],
      firstUpdate: true
    };
  },
  computed: {
    action() {
      return serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/fileUploadNew';
    }
  },
  watch: {
    value(val) {
      if (Array.isArray(val)) {
        const flag = this.diffArray(val, this.fileList);
        if (!flag) this.initFileList();
      }
    }
  },
  created() {
    this.headers = { Authorization: 'Bearer ' + accessToken.get() };
    this.firstUpdate = true;
    this.initFileList();
  },
  activated() {
    this.firstUpdate = true;
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
      if (this.firstUpdate) {
        this.firstUpdate = false;
        this.firstFileList = _.cloneDeep(this.fileList);
      }
    },
    // 预览
    preview(file) {
      this.$refs['preview'].getPreViewUrl(file.name, file.id);
    },
    // 下载
    async downloadFile(file) {
      if (file.url) {
        try {
          this.loading = true;
          const res = await axios({
            method: 'get',
            url: file.url,
            responseType: 'blob'
          });
          let data = res?.data || res;
          const blob = new Blob([data]);
          let elink = document.createElement('a');
          elink.download = file.name || 'filename';
          elink.style.display = 'none';
          let href = window.URL.createObjectURL(blob);
          elink.href = href;
          document.body.appendChild(elink);
          elink.click();
          document.body.removeChild(elink);
          window.URL.revokeObjectURL(href); // 释放掉blob对象
        } catch (error) {
          console.log(error);
        } finally {
          this.loading = false;
        }
      }
    },
    // 删除
    deleteFile(file) {
      this.$confirm({
        title: '您确定要删除该文件吗？',
        okText: '确定删除',
        cancelText: '取消',
        onOk: () => {
          this.fileList = this.fileList.filter(item => {
            return item.uid !== file.uid;
          });
          this.handlePathChange();
        },
        onCancel: () => {}
      });
    },
    beforeUpload(file, fileList) {
      if (file.size > this.maxSize * 1024 * 1024) {
        this.$message.warning(`文件大小需要小于${this.maxSize}M！`);
        return false;
      }
      if (this.fileList.length > this.limit) {
        this.$message.warning(`最多上传${this.limit}个文件`);
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
      if (fileList.length > this.limit) {
        fileList = fileList.slice(0, this.limit);
        this.$message.warning(`最多上传${this.limit}个文件`);
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
          item.createTime = item.time;
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
      this.addFileList = [];
      let index = 0;
      value.forEach(a => {
        if (
          !this.firstFileList.find(b => {
            return b.id === a.id;
          })
        ) {
          this.$set(this.addFileList, index, a);
          index++;
        }
      });
      this.delFileList = [];
      index = 0;
      this.firstFileList.forEach(a => {
        if (
          !value.find(b => {
            return b.id === a.id;
          })
        ) {
          this.$set(this.delFileList, index, a);
          index++;
        }
      });
      this.$emit('change', value.length ? value : []);
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
    // 判断两个数组内容是否一致
    diffArray(arrayOld, arrayNew) {
      if (arrayOld.length !== arrayNew.length) {
        return false;
      }
      for (let i = 0; i < arrayOld.length; i++) {
        const flag = arrayNew.find(a => {
          return a.id === arrayOld[i].id;
        });
        if (!flag) return false;
      }
      return true;
    }
  }
};
</script>
<style lang="less" scoped>
.uploader {
  display: flex;
  align-items: center;
  .files {
    list-style: none;
    display: flex;
    li {
      text-align: center;
      margin-right: 15px;
      padding: 5px;
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
