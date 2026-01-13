<template>
  <div class="file-item" :class="fileItem.status === 'error' ? 'errorFile' : ''">
    <div class="item-header">
      <img :src="getImg(fileItem.fileName, fileItem.status)" class="img-box" />
      <span>{{ fileItem.fileName }}</span>
    </div>
    <div class="item-time">{{ fileItem.time }}</div>
    <div class="item-box">
      <a :disabled="fileItem.status === 'error'" @click="preview"> 预览 </a>
      <w-divider type="vertical"></w-divider>
      <a :disabled="fileItem.status === 'error'" @click="downloadFile"> 下载 </a>
    </div>
    <preview ref="preview" :showModel="true" />
  </div>
</template>

<script>
import Preview from '../VuePreview';
import pdfIcon from './icon/pdf.svg';
import docxIcon from './icon/docx.svg';
import xlsIcon from './icon/xls.svg';
import generalIcon from './icon/general.svg';
import errorIcon from './icon/error.svg';
import serverConfig from '@/config/server.config';
import axios from 'axios';
export default {
  name: 'FileItem',
  props: {
    file: {
      type: Object,
      default: () => {}
      // {
      //   id: "1",
      //   name: "xxx.docx",
      //   status: "uploading",
      //   time: "2022年01月22日 10:00",
      //   url: "uploader",
      // }
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
      fileItem: {},
      previewBaseUrl: serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/download/'
    };
  },
  computed: {
    btnOptions() {
      return this.file.btnOptions ? this.file.btnOptions : this.btnOpts;
    }
  },
  watch: {},
  created() {
    this.initFile();
  },
  methods: {
    uidGenerator() {
      return '-' + parseInt(Math.random() * 10000 + 1, 10);
    },
    getFileName(path) {
      let p = path;
      if (p.lastIndexOf('\\') >= 0) {
        let reg = /\\\\/g;
        p = p.replace(reg, '/');
      }
      return p.substring(p.lastIndexOf('/') + 1);
    },
    getFileAccessHttpUrl(avatar, previewBaseUrl, subStr = serverConfig.PUBLIC_API_BASE_URL+'/') {
      if (avatar?.startsWith(subStr) || avatar?.startsWith('http')) {
        return avatar;
      } else {
        return previewBaseUrl + avatar;
      }
    },
    initFile() {
      let fileName = this.getFileName(this.file.fileName || '');
      let url = this.getFileAccessHttpUrl(this.file.fileId || '', this.previewBaseUrl);
      this.fileItem = {
        ...this.file,
        status: 'done',
        uid: this.uidGenerator(),
        name: fileName,
        url,
        time: this.file.time ? this.$moment(this.file.time).format('YYYY年MM月DD日 HH:mm') : '',
        type: this.file.mediaType || this.file?.type,
        id: this.file.fileId
      };
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
    // 预览
    preview() {
      this.$refs['preview'].getPreViewUrl(this.fileItem.name, this.fileItem.id);
    },
    // 下载
    async downloadFile() {
      if (this.fileItem.url) {
        try {
          this.loading = true;
          const res = await axios({
            method: 'get',
            url: this.fileItem.url,
            responseType: 'blob'
          });
          let data = res?.data || res;
          const blob = new Blob([data]);
          let elink = document.createElement('a');
          elink.download = this.fileItem.name || 'filename';
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
    deleteFile() {
      this.$emit('deleteFile', this.file);
    }
  }
};
</script>

<style lang="less" scoped>
.file-item {
  display: inline-block;
  .item-header {
    img {
      width: 28px;
      height: 36px;
      margin-right: 8px;
    }
  }
  .item-time {
    margin-top: 8px;
    color: #999999;
  }
  .item-box {
    .wpg-divider {
      margin: 10px;
    }
  }
}
</style>
