<template>
  <w-modal
    v-model="visible"
    v-if="showModel"
    :width="width"
    :title="title"
    closable
    :bodyStyle="{ height: '70vh', overflowY: 'scroll' }"
    class="preview"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <slot name="extra"></slot>
    <!-- pdf预览 -->
    <div class="pdf preBox" v-if="fileType === '0'" v-loading="loading">
      <iframe :src="pdfUrl" title="pdf预览" style="width: 100%; height: 100%"></iframe>
    </div>
    <!-- .docx预览 -->
    <div
      v-else-if="fileType === '1'"
      class="docx preBox"
      v-html="wordText"
      v-loading="loading"
    ></div>
    <!-- excel预览 -->
    <div
      v-else-if="fileType === '2'"
      class="excel preBox"
      v-html="fileContent"
      v-loading="loading"
    ></div>
    <!-- image预览 -->
    <div v-else-if="fileType === '3'" class="img-wrapper preBox" v-loading="loading">
      <img :src="imgUrl" alt="" class="image" />
    </div>
    <div v-else-if="fileType === '4'" style="height: 100%" v-loading="loading">
      <iframe
        :src="iframeUrl"
        title="文件预览"
        style="width: 100%; height: 100%; text-align: center"
      ></iframe>
    </div>
    <div
      v-else-if="fileType === '5'"
      class="preBox"
      style="white-space: pre"
      v-text="txtString"
      v-loading="loading"
    ></div>
    <div slot="footer">
      <w-button v-if="footer" type="primary" @click="visible = false">关闭</w-button>
    </div>
  </w-modal>
  <div v-else style="height: 100%">
    <!-- pdf预览 -->
    <div class="pdf preBox" v-if="fileType === '0'" v-loading="loading">
      <iframe :src="pdfUrl" title="pdf预览" style="width: 100%; height: 100%"></iframe>
    </div>
    <!-- .docx预览 -->
    <div
      v-else-if="fileType === '1'"
      class="docx preBox"
      v-html="wordText"
      v-loading="loading"
    ></div>
    <!-- excel预览 -->
    <div
      v-else-if="fileType === '2'"
      class="excel preBox"
      v-html="fileContent"
      v-loading="loading"
    ></div>
    <!-- image预览 -->
    <div v-else-if="fileType === '3'" class="img-wrapper preBox" v-loading="loading">
      <img :src="imgUrl" alt="" class="image" />
    </div>
    <div v-else-if="fileType === '4'" style="height: 100%" v-loading="loading">
      <iframe
        :src="iframeUrl"
        title="文件预览"
        style="width: 100%; height: 100%; text-align: center"
      ></iframe>
    </div>
    <div
      v-else-if="fileType === '5'"
      class="preBox"
      style="white-space: pre"
      v-text="txtString"
      v-loading="loading"
    ></div>
  </div>
</template>

<script>
import request from 'axios';
// docx文档预览(只能转换.docx文档，转换过程中复杂样式被忽，居中、首行缩进等)
import mammoth from 'mammoth';
import xlsx from 'xlsx';
import serverConfig from '@/config/server.config';
// import getServeConfig from "@/config/serve.config";

const axios = request.create();

export default {
  components: {},
  name: 'VuePreview',
  props: {
    width: {
      type: String || Number,
      default: '80%'
    },
    showModel: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: undefined
    },
    footer: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      pdfUrl: '',
      visible: false,
      fileType: '',
      wordText: '',
      fileContent: '',
      preview0: ['pdf'],
      preview1: ['docx'],
      preview2: ['xlsx'],
      preview3: ['png', 'gif', 'bmp', 'jpg', 'jpeg'],
      preview4: ['cpt'],
      preview5: ['txt'],
      imgUrl: '',
      iframeUrl: '',
      txtString: '',
      loading: false
    };
  },

  methods: {
    getPreViewUrl(fileType, fileId) {
      if (!fileType || !fileId) {
        this.$message.error('文件不存在');
        return false;
      }
      let type = this.judgeFileType(fileType);
      this.visible = true;
      if (this.preview0.includes(type.toLowerCase())) {
        this.fileType = '0';
        this.getPdfFile(fileId);
      } else if (this.preview1.includes(type.toLowerCase())) {
        this.fileType = '1';
        this.getWordText(fileId);
      } else if (this.preview2.includes(type.toLowerCase())) {
        this.fileType = '2';
        this.getExcel(fileId);
      } else if (this.preview3.includes(type.toLowerCase())) {
        this.fileType = '3';
        this.imgUrl =
          `${serverConfig.PUBLIC_API_BASE_URL}/userCenterApi/FileManager/download/` + fileId;
      } else if (this.preview4.includes(type.toLowerCase())) {
        this.fileType = '4';
        this.iframeUrl = fileId;
      } else if (this.preview5.includes(type.toLowerCase())) {
        this.fileType = '5';
        this.getTxt(fileId);
      }
    },
    // 转化流文件
    getPdfFile(fileId) {
      try {
        this.loading = true;
        axios({
          url: this.getUrl(fileId),
          responseType: 'blob',
          method: 'get',
          headers: {
            'Content-Type': 'application/pdf'
          }
        }).then(res => {
          let url = window.URL.createObjectURL(new Blob([res.data]), {
            type: 'application/pdf;charset-UTF-8'
          });
          this.pdfUrl = '/pdf/web/viewer.html?file=' + encodeURIComponent(url);
          this.loading = false;
        });
      } catch {
        this.$message.error('请求失败');
        this.loading = false;
      }
    },

    // 转化流文件
    getTxt(fileId) {
      try {
        this.loading = true;
        axios({
          url: this.getUrl(fileId),
          method: 'get'
        }).then(res => {
          this.txtString = res.data;
          this.loading = false;
        });
      } catch {
        this.loading = false;
        this.$message.error('请求失败');
      }
    },
    getWordText(fileId) {
      try {
        this.loading = true;
        axios({
          url: this.getUrl(fileId),
          responseType: 'arraybuffer',
          method: 'get'
        }).then(res => {
          mammoth.convertToHtml({ arrayBuffer: new Uint8Array(res.data) }).then(resultObject => {
            this.$nextTick(() => {
              this.wordText = resultObject.value;
            });
          });
          this.loading = false;
        });
      } catch {
        this.loading = false;
        this.$message.error('请求失败');
      }
    },
    getExcel(fileId) {
      try {
        this.visible = true;
        this.loading = true;
        axios({
          url: this.getUrl(fileId),
          responseType: 'blob',
          method: 'get'
        }).then(response => {
          this.loading = false;
          let reader = new FileReader();
          reader.onload = e => {
            // 预处理
            let binary = '';
            let buf = new Uint8Array(e.target.result);
            let length = buf.byteLength;
            for (let i = 0; i < length; i++) {
              binary += String.fromCharCode(buf[i]);
            } // 读取excel
            const wb = xlsx.read(binary, { type: 'binary' });
            // 抓取第一个sheet
            let wsname = wb.SheetNames[0];
            let ws = wb.Sheets[wsname];
            this.fileContent = xlsx.utils.sheet_to_html(ws);
          };
          reader.readAsArrayBuffer(response.data);
        });
      } catch {
        this.loading = false;
        this.$message.error('请求失败');
      }
    },

    handleCancel() {
      this.pdfUrl = '';
      this.wordText = '';
      this.fileContent = '';
      this.imgUrl = '';
      this.iframeUrl = '';
      this.txtString = '';
      this.visible = false;
    },
    handleOk() {
      this.visible = false;
    },
    judgeFileType(fileType) {
      if (fileType.includes('.')) {
        let typeList = fileType.split('.');
        return typeList[typeList.length - 1];
      } else {
        return fileType;
      }
    },
    //  处理预览路径
    getUrl(url) {
      if (url.includes(':')) {
        return url;
      } else {
        return `${serverConfig.PUBLIC_API_BASE_URL}/userCenterApi/FileManager/download/${url}`;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.img-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  img {
    height: inherit;
  }
}
.preBox {
  width: 100%;
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
}
.preview {
  /deep/ .wpg-modal-body {
    &::-webkit-scrollbar {
      width: 0;
    }
  }
}
</style>
