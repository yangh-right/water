<template>
  <div :id="`player${videoId}`" class="player" v-resize="handleResize"></div>
</template>

<script>
import {
  getHlsUrlByVideoNo
} from '@/api/public';
export default {
  name: 'H5Back',
  props: {
    videoId: {
      type: String,
      required: true,
      default: ''
    },
    protocal: {
      type: String,
      required: true,
      default: 'ws'
    }
  },
  data() {
    return {
      player: null,
      curIndex: 0,
      playSuccess: false
    };
  },
  watch: {},
  activated() {
    this.init();
    if (this.videoId) {
      this.showPreview();
    }
  },
  deactivated() {
    if (this.player) {
      this.player.JS_Stop(); // 销毁
    }
  },
  mounted() {
    this.init();
    if (this.videoId) {
      this.showPreview();
    }
  },
  beforeDestroy() {
    if (this.player) {
      // this.player.JS_DestroyWorker(); // 销毁
      this.player.JS_Stop();
    }
  },
  methods: {
    handleResize() {
      if (this.player) {
        this.player.JS_Resize();
      }
    },
    init() {
      const publicPath = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ ?? './';
      this.player = new window.JSPlugin({
        szId: `player${this.videoId}`, //需要英文字母开头 必填
        szBasePath: `${publicPath}js/hkH5/`, // 必填
        iCurrentSplit: 1,
        oStyle: {
          border: '#343434',
          borderSelect: '#FFCC00',
          background: '#000'
        }
      });
      this.player.JS_SetWindowControlCallback({
        windowEventSelect: function (index) {
          //插件选中窗口回调
          this.curIndex = index;
        },
        pluginErrorHandler: function (index, iErrorCode, oError) {
          //插件错误回调
          console.log(index, iErrorCode, oError);
        }
      });
    },
    async showPreview() {
      try {
        //  获取ISC视频设备hls流
        // const getISCHLS = '/deviceManagmentApi/videoISC/getHlsUrlByVideoNo/';
                 let params={
            videoId:this.videoId,
            protocal:this.protocal
          }
        const { resultData } = await getHlsUrlByVideoNo(params);
        if (resultData) {
          this.player
            .JS_Play(resultData, { playURL: resultData, mode: 1 }, 0)
            .then(() => {
              this.playSuccess = true;
              console.log('预览成功播放');
            })
            .catch(() => {
              this.playSuccess = false;
              this.$message.error('暂无视频资源');
            });
        }
      } catch (e) {
        this.playSuccess = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.player {
  width: 100%;
  height: 100%;
}
</style>
