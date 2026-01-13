<template>
  <div
    v-show="isFramePage"
    ref="wpgFrame"
    class="frameMgr"
    :class="[
      isPadding ? 'innerPadding' : '',
      isVideoFrame ? 'frameVideo' : '',
      isDeviceFrame ? 'deviceFrame' : '',
      isicoVideoFrame ? 'icoVideo' : '',
      isSzlsFrame ? 'szlsFrame' : ''
    ]"
  >
    <!-- 添加加载过渡 -->
    <transition name="spin-fade">
      <w-spin v-if="curPage && !curPage.loaded" class="wbgc-card" />
    </transition>
    <!-- iframe组 -->
    <iframe
      v-for="page in pages"
      v-show="page.path === $route.path"
      ref="myiframe"
      title=""
      :key="page.iframeSrc"
      :src="page.iframeSrc"
      @load="onIframeLoad($event, page)"
    />
  </div>
</template>

<script>
import parse from 'url-parse';
import querystring from 'query-string';

export default {
  name: 'wpg-frame',
  inject: ['state'],
  props: {
    token: String, // token
    sysCode: String, // 系统code
    frameHost: String, // 用于开发环境下调试相对链接
    frameMapping: Object // frame映射表，格式为 {<path>:<frameUrl>}
  },
  data() {
    return {
      pages: [], // iframe页面列表
      curPage: null, // 当前展示的page
      outerPaddingRoutes: [
        '/onlineExam',
        '/PlanManagement/ExamPlan',
        '/QuestionManagement/TestPaper',
        '/QuestionManagement/TestQuestion',
        '/QuestionManagement/KnowledgeBase',
        '/examineeAnalysis',
        '/resourceManage',
        '/emergencyMap',
        '/work-manage/detail',
        '/water_purification/work-manage/detail',
        '/water_purification/manage/all'
      ],
      videoPaddingRoutes: ['/factoryMonitoring'],
      devicePaddingRoutes: ['/electronicFence/device'],
      micVideoPaddingRoutes: [
        '/water_purification/factoryMonitoring',
        '/water_purification/electronicFence/device'
      ],
      isSzls: ['/water_purification/szls'],
      isVideoFrame: false,
      isicoVideoFrame: false,
      isSzlsFrame: false,
      isPadding: false,
      isDeviceFrame: false
    };
  },
  computed: {
    // 是否是iframe页面
    isFramePage() {
      return this.frameMapping?.[this.$route.path] !== undefined;
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler: 'handleRouteChange'
    },
    'state.tabs': 'handleTabsChange',
    'state.theme': 'handleThemeChange'
  },
  mounted() {
    this.initEvent();
  },
  methods: {
    /* ----------------------------------------iframe通信---------------------------------------- */
    /**
     * 初始化事件
     */
    initEvent() {
      window.addEventListener('message', this.handleFrameEvent, false);
      this.$once('hook:beforeDestroy', () => {
        window.removeEventListener('message', this.handleFrameEvent, false);
      });
    },

    /**
     * 处理iframe事件
     */
    handleFrameEvent(e) {
      const { data } = e;
      // 判断是否为本系统对接的页面
      if (data && data.sysCode === this.sysCode) {
        switch (data.cmd) {
          case 'closeTab':
            this.$emit('closeTab', data.params);
            break;
          case 'goto':
            this.$emit('goto', data.params);
            break;
          case 'logout':
            this.$emit('logout', data.params);
            break;
        }
      }
    },

    /**
     * 处理主题切换
     */
    handleThemeChange(theme) {
      this.postMessage({ cmd: 'themeChange', params: { theme } });
    },

    /**
     * iframe通信
     * @param data
     */
    postMessage(data) {
      const iframes = this.$refs.wpgFrame?.getElementsByTagName('iframe');
      if (iframes) {
        Array.prototype.forEach.call(iframes, iframe => {
          // 通知已加载的iframe
          iframe.contentWindow.postMessage(data, '*');
          // 通知加载中的iframe
          iframe.addEventListener(
            'load',
            function load() {
              // eslint-disable-next-line no-invalid-this
              this.contentWindow.postMessage(data, '*');
              // eslint-disable-next-line no-invalid-this
              this.removeEventListener('load', load, false);
            },
            false
          );
        });
      }
    },

    /* ----------------------------------------iframe展示---------------------------------------- */
    /**
     * 处理路由切换
     */
    handleRouteChange() {
      const path = this.$route.path;
      // 嵌套页面padding改善
      if (this.outerPaddingRoutes.includes(path)) {
        this.isPadding = true;
      } else {
        this.isPadding = false;
      }
      if (this.videoPaddingRoutes.includes(path)) {
        this.isVideoFrame = true;
        // 处理独立入口video错位
        const iframe = document.getElementsByTagName('iframe');
      } else {
        this.isVideoFrame = false;
      }
      if (this.devicePaddingRoutes.includes(path)) {
        this.isDeviceFrame = true;
      } else {
        this.isDeviceFrame = false;
      }
      if (this.micVideoPaddingRoutes.includes(path)) {
        this.isicoVideoFrame = true;
      } else {
        this.isicoVideoFrame = false;
      }
      if (this.isSzls.includes(path)) {
        this.isSzlsFrame = true;
      } else {
        this.isSzlsFrame = false;
      }
      /**
       * 路由切换时显示或隐藏视频（插件播放时使用，event.data.cmd === "setHideVideo"，event.data.params传true或false）
       * */
      if (path.includes('/runMonitor/multiScreen')) {
        // 初始化播放类型，默认插件播放 (流媒体：1，插件：2)
        // let {status, resultData} = await getUserSetting('videoPlayType');
        // if (status === 'complete') {
        //   this.dataType = (resultData && resultData.value === '1') ? '1' : '2';
        // }
        this.postMessage({ cmd: 'setHideVideo', params: false }, '*');
      } else {
        this.postMessage({ cmd: 'setHideVideo', params: true }, '*');
      }
      if (this.isFramePage) {
        const url = this.genUrl();
        let page = this.pages.find(page => page.path === path);

        if (!page) {
          // 添加页面
          page = { path, iframeSrc: url, loaded: false };
          this.pages.push(page);
        } else if (page.iframeSrc !== url) {
          // 更新页面
          page.iframeSrc = url;
          page.loaded = false;
        }

        this.curPage = page;
        // 通知加载页面切换主题
        this.$nextTick(() => {
          this.handleThemeChange(this.state.theme);
        });
      } else {
        this.curPage = null;
      }
    },

    /**
     * 处理tab变化
     * @param tabs
     */
    handleTabsChange(tabs) {
      this.pages = this.pages.filter(page => tabs.some(v => v.key === page.path));
    },

    /**
     * 生成链接
     */
    genUrl() {
      let rawFrameSrc = this.frameMapping?.[this.$route.path];
      // rawFrameSrc = 'http://10.10.102.89:8899' + rawFrameSrc
      let frameSrc = '';

      if (rawFrameSrc) {
        const parsed = parse(rawFrameSrc);

        // 开发环境下如果是相对路径，替换链接host，便于调试
        if (/^\//.test(rawFrameSrc) && process.env.NODE_ENV === 'development') {
          parsed.set('host', this.frameHost);
        }

        frameSrc = parsed.origin + parsed.pathname;
        // 如果存在hash，则判定为hash路由，否则为history路由
        if (parsed.hash) {
          const hashObj = parse(parsed.hash.substr(1));
          frameSrc += '#' + hashObj.pathname + this.genSearch(hashObj.query);
        } else {
          frameSrc += this.genSearch(parsed.query);
        }
      }

      return frameSrc;
    },

    /**
     * 生成链接search参数
     */
    genSearch(search) {
      // 需要添加的参数（优先级低，因为有些特殊页面会写死token）
      const addQuery = {
        token: this.token,
        sysCode: this.sysCode,
        theme: this.state.theme
        // activeMediaPlugin: this.dataType
      };

      // 当前路由参数（优先级中）
      const routeQuery = this.$route.query;
      // iframe链接中的参数（优先级高）
      let srcQuery = null;
      if (search) {
        srcQuery = querystring.parse(search);
      }
      // 拼接参数字符串
      const queryString = querystring.stringify({ ...addQuery, ...routeQuery, ...srcQuery });
      return queryString ? '?' + queryString : '';
    },

    /**
     * 注入 .page-content 样式到 iframe 内部
     */
    injectPageContentStyle(iframe) {
      if (!iframe || !iframe.contentDocument) return;
      // 同源情况下，获取 iframe 内部的 document 对象
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const style = iframeDoc.createElement('style');
      style.innerHTML = `
        .page-content {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
          padding-top: 1.75rem !important;
          padding-bottom: 0rem !important;
        }
      `;
      iframeDoc.head.appendChild(style);
    },

    /**
     * iframe 加载事件处理
     */
    onIframeLoad(event, page) {
      page.loaded = true;
      if (this.isVideoFrame) {
        this.injectPageContentStyle(event.target);
      }
    }
  }
};
</script>

<style scoped lang="less">
.frameMgr {
  position: relative;
  height: calc(100% + 24px) !important;
}
.frameVideo {
  margin: -30px -12px;
}
.deviceFrame {
  margin: -12px;
}
.icoVideo {
  margin: 0 -12px -12px -12px;
}
.szlsFrame {
  height: calc(100% + 196px) !important;
}
.innerPadding {
  height: calc(100% + 0px) !important;
  margin: 0 0 !important;
}
.wpg-spin {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #fff;
}
iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.spin-fade {
  &-leave-active {
    opacity: 1;
    transition: opacity 0.3s;
  }

  &-leave-to {
    opacity: 0;
  }
}
</style>
