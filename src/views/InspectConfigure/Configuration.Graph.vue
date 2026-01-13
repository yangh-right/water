<template>
  <div class="supply-h-full supply-w-full">
    <iframe ref="iframe" class="supply-h-full supply-w-full" title="组态" :src="iframeUrl"></iframe>
  </div>
</template>

<script>
import { VUE_APP_HOST } from '@/constants';
import { defineComponent } from '@vue/composition-api';
import { accessToken } from '@wpg/framework-vue';

export default defineComponent({
  name: 'Configuration',
  props: {
    graphIndex: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },

  mounted() {
    window.addEventListener('message', e => {
      if (e.data?.message === 'dataLoaded') {
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
    loaded() {
      this.iframeWindow.postMessage({ name: 'getInspectList' }, '*');
    },

    getList(data) {
      console.log('list', data);
    }
  }
});
</script>
