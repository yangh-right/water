<template>
  <div class="pdf">
    <iframe :src="pdfUrl" title="预览文件" style="width: 100%; height: 100%"></iframe>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'Pdf',
  props: {
    previewUrl: {
      // 预览文件下载地址
      type: String,
      require: true
    }
  },
  data() {
    return {
      pdfUrl: ''
    };
  },
  methods: {
    // 转化流文件
    getPreviewUrl() {
      axios({
        url: 'http://10.10.15.219:18094/userCenterApi/FileManager/download/67988872465085890563582',
        // url: this.previewUrl,
        responseType: 'blob',
        method: 'get',
        headers: {
          'Content-Type': 'application/pdf'
        }
      }).then(res => {
        let url = window.URL.createObjectURL(new Blob([res.data]), {
          type: 'application/pdf;charset-UTF-8'
        });
        this.pdfUrl = '/static/pdf/web/viewer.html?file=' + encodeURIComponent(url);
      });
    }
  }
};
</script>

<style lang="less" scoped>
.pdf {
  width: 100%;
  height: 100%;
}
</style>
