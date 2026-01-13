<template>
  <div class="preview-box">
    <!-- pdf预览 -->
    <iframe
      v-if="fileType === '0'"
      :src="pdfUrl"
      title="pdf预览"
      style="width: 100%; height: 100%"
    ></iframe>

    <!-- .docx预览 -->
    <div v-if="fileType === '1'" id="wordView" class="docx" v-html="wordText"></div>

    <!-- excel预览 -->
    <div v-if="fileType === '2'" id="excelView" class="excel" v-html="fileContent"></div>

    <!-- image预览 -->
    <div v-if="fileType === '3'" class="img-wrapper">
      <img :src="imgUrl" alt="" class="image" />
    </div>
    <div v-if="fileType === '4'" style="height: 100%">
      <iframe
        :src="iframeUrl"
        title="视频监控"
        style="width: 100%; height: 100%; text-align: center"
      ></iframe>
    </div>
  </div>
</template>

<script>
import request from 'axios';
// docx文档预览(只能转换.docx文档，转换过程中复杂样式被忽，居中、首行缩进等)
import mammoth from 'mammoth';
import xlsx from 'xlsx';
// import getServeConfig from "@/config/serve.config";
const axios = request.create();
export default {
  components: {},
  props: {
    width: {
      type: String || Number,
      default: '80%'
    }
  },
  data() {
    return {
      pdfUrl: '',
      visible: false,
      fileType: '',
      wordText: '',
      fileContent: '',
      preview0: ['pdf', 'txt'],
      preview1: ['docx'],
      preview2: ['xlsx'],
      preview3: ['png', 'gif', 'bmp', 'jpg', 'jpeg'],
      preview4: ['cpt'],
      imgUrl: '',
      iframeUrl: ''
    };
  },

  methods: {
    getPreViewUrl(fileType, fileId) {
      if (!fileType || !fileId) {
        this.$message.error('文件不存在');
        return false;
      }
      let type = this.judgeFileType(fileType);
      if (this.preview0.includes(type)) {
        this.fileType = '0';
        this.getPdfFile(fileId);
      }
      if (this.preview1.includes(type)) {
        this.fileType = '1';
        this.getWordText(fileId);
      }
      if (this.preview2.includes(type)) {
        this.fileType = '2';
        this.getExcel(fileId);
      }
      if (this.preview3.includes(type)) {
        this.fileType = '3';
        this.imgUrl = `ghgg/waterwork-sys-api/FileManagerFun/download/` + fileId;
        this.visible = true;
      }
      if (this.preview4.includes(type)) {
        this.fileType = '4';
        this.iframeUrl = fileId;
        this.visible = true;
      }
    },
    // 转化流文件
    getPdfFile(fileId) {
      try {
        axios({
          url: this.getPreviewUrl(fileId),
          responseType: 'blob',
          method: 'get',
          headers: {
            'Content-Type': 'application/pdf'
          }
        }).then(res => {
          let url = window.URL.createObjectURL(new Blob([res.data]), {
            type: 'application/pdf;charset-UTF-8'
          });
          this.pdfUrl = 'static/pdf/web/viewer.html?file=' + encodeURIComponent(url);
          this.visible = true;
        });
      } catch {
        this.$message.error('请求失败');
      }
    },
    getWordText(fileId) {
      try {
        axios({
          url: this.getPreviewUrl(fileId),
          responseType: 'arraybuffer',
          method: 'get'
        }).then(res => {
          mammoth.convertToHtml({ arrayBuffer: new Uint8Array(res.data) }).then(resultObject => {
            this.$nextTick(() => {
              this.wordText = resultObject.value;
            });
          });
          this.visible = true;
        });
      } catch {
        this.$message.error('请求失败');
      }
    },
    getExcel(fileId) {
      try {
        axios({
          // url: 'http://10.10.15.219:18094/userCenterApi/FileManager/download/67999509595168440323679',
          url: this.getPreviewUrl(fileId),
          responseType: 'blob',
          method: 'get'
        }).then(response => {
          this.visible = true;
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
            // setContent 是用来赋值 this.fileContent = xlsx.utils.sheet_to_html(ws)
            this.fileContent = xlsx.utils.sheet_to_html(ws);
          };
          reader.readAsArrayBuffer(response.data);
        });
      } catch {
        this.$message.error('请求失败');
      }
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
    getPreviewUrl(url) {
      if (url.includes(':')) {
        return url;
      } else {
        return 'aaa';
        // return `${getServeConfig().BASE_API_URL}/waterwork-sys-api/FileManagerFun/download/${url}`;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.preview-box {
  height: 100%;
}
.img-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>
