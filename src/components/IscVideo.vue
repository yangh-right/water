<!--
 * @Author: chenzh
 * @Date: 2021-10-11 10:03:06
 * @LastEditTime: 2023-07-12 10:40:05
 * @LastEditors: Do not edit
 * @Description: 海康 isc h5 视频播放
 * @FilePath: \ergongscreen\src\components\IscVideo.vue
-->
<template>
  <div class="isc-h5-video vjs-waiting">
    <div v-if="loading" class="vjs-loading-spinner" dir="ltr"></div>
    <div class="isc-h5-video-box" :id="playerId"></div>
  </div>
</template>

<script>
import uuid from '@/utils/uuid';

let iGlobalVideoIdx = 0;

export default {
  name: 'IscVideo',

  props: {
    playUrl: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      loading: true,
      // mode: 1,
      mode: 1,
      playerId: uuid()
    };
  },

  watch: {
    playUrl() {
      setTimeout(() => {
        if (this.playUrl) {
          this.realplay();
        } else {
          this.stopplay();
        }
      });
    }
  },

  mounted() {
    this.init();

    setTimeout(() => {
      if (this.playUrl) {
        this.realplay();
      }
    });
  },

  beforeDestroy() {},

  methods: {
    init() {
      this.createPlayer();
      this.createEvents();
    },

    createEvents() {
      // 设置播放容器的宽高并监听窗口大小变化
      window.addEventListener('resize', () => {
        this.player.JS_Resize();
      });
    },

    createPlayer() {
      const _path =
        window.location.origin.indexOf('localhost') > -1
          ? `/static/hkisc/`
          : `/bigPage/static/hkisc/`;
      this.player = new window.JSPlugin({
        szId: this.playerId,
        szBasePath: _path,
        iMaxSplit: 1,
        iCurrentSplit: 1,
        // bSupportSound: false,
        iGlobalVideoIdx: iGlobalVideoIdx,
        openDebug: true,
        oStyle: {
          borderSelect: '#000000'
        }
      });

      iGlobalVideoIdx = iGlobalVideoIdx + 1;
    },

    /* 预览 */
    realplay() {
      let { player, mode } = this;
      let index = player.currentWindowIndex;
      this.loading = true;
      player.JS_Play(this.playUrl, { playURL: this.playUrl, mode }, index).then(
        () => {
          this.loading = false;
        },
        e => {
          console.error(e);
        }
      );
    },

    stopplay() {
      this.player.JS_Stop().then(
        () => {
          console.log('stop realPlay success');
        },
        e => {
          console.error(e);
        }
      );
    }
  }
};
</script>

<style lang="less" scoped>
.isc-h5-video {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  .vjs-loading-spinner {
    // transform: scale(0.5);
    z-index: 2;
  }

  .isc-h5-video-box {
    width: 100% !important;
    height: 100% !important;
    pointer-events: none; // 禁止屏幕双击
  }
}
</style>
