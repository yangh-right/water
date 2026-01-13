<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-07-02 14:55:37
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-07-04 17:18:06
 * @Description: 
-->
<!--
 * @Date: 2021-10-13 11:06:19
 * @Author: weixinqi
 * @Description:
 * @Last Modified time: 2021-10-13 11:06:19
 * @Last Modified by: weixinqi
 -->
<template>
  <w-modal
    v-bind="$attrs"
    class="secondary-modal"
    title="文件预览"
    :visible="visible"
    width="1000px"
    :footer="false"
    @cancel="handleCancel"
  >
    <div class="preview-container">
      <img
        v-if="fileType === 'image'"
        :src="url"
        style=" width: 100%; height: 100%; object-fit: contain;"
      />
      <iframe v-else :src="url" title="图片放大" width="100%" height="100%"></iframe>
    </div>
  </w-modal>
</template>
<script>
import serverConfig from '@/config/server.config';
import { getBlob } from '@/utils/util';
export default {
  name: 'UploadDialog',
  components: {},
  filters: {},
  props: {
    fileData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      visible: false,
      url: '',
      baseImgApi: serverConfig.IMG_BASE_URL
    };
  },
  computed: {
    fileType() {
      return this.fileData?.fileType || '';
    }
  },
  watch: {
    visible(v) {
      if (v) {
        this.getData();
      }
    }
  },
  methods: {
    handleCancel() {
      this.url = '';
      this.visible = false;
    },
    getData() {
      if (this.fileType === 'image') {
        this.url = this.fileData.url;
      } else {
        getBlob(this.fileData.url, blob => {
          this.url = window.URL.createObjectURL(blob);
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.preview-container {
  height: 550px;
}
</style>
