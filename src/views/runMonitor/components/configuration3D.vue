<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-05-06 19:28:44
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-06-06 09:12:56
 * @Description: 
-->
<template>
  <div v-resize="resize" class="supply-h-full supply-w-full supply-relative">
    <w-spin class="iframe-spin" :spinning="loading"></w-spin>
    <iframe
      :key="key"
      ref="iframe"
      title="组态"
      class="supply-h-full supply-w-full"
      :src="iframeUrl"
    ></iframe>
  </div>
</template>

<script>
import { VUE_APP_HOST } from '@/constants';
import { accessToken } from '@wpg/framework-vue';
import uuid from '@/utils/uuid';

export default {
  name: 'Configuration3D',
  props: {
    graphIndex: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      key: 'iframe'
    };
  },

  mounted() {
    this.genLoading();
    window.addEventListener('message', e => {
      if (e.data?.message === 'dataLoaded') {
        this.loading = false;
        this.loaded();
      } else if (e.data?.message === 'getInspectList') {
        this.getList(e.data);
      }
    });
  },

  computed: {
    iframeUrl() {
      const token = accessToken.get();
      return `${process.env?.NODE_ENV === 'development' ? VUE_APP_HOST : ''}${
        this.graphIndex
      }&token=${token}&parent=${window.origin}`;
    },
    iframeWindow() {
      return this.$refs.iframe.contentWindow;
    }
  },

  methods: {
    genLoading() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 4000);
    },
    loaded() {
      this.iframeWindow.postMessage({ name: 'getInspectList' }, '*');
    },
    resize() {
      this.key = uuid();
      this.genLoading();
    },
    getList(data) {
      console.log('list', data);
    }
  }
};
</script>
<style lang="less" scoped>
.iframe-spin {
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
