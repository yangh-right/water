<template>
  <div class="play-video">
    <video ref="videoPlayer" class="video-js vjs-big-play-centered"></video>
  </div>
</template>

<script>
import {
  getHlsUrlByVideoNo
} from '@/api/public';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-hls';
import videoPlayer from '@/utils/mixins/video-player.js';
const zhCN = require('video.js/dist/lang/zh-CN.json');
videojs.addLanguage('zh-CN', zhCN);
export default {
  name: 'VideoPlayer',
  mixins: [videoPlayer],
  props: {
    videoType: {
      type: String,
      default: ''
    },
    videoId: {
      type: String,
      default: ''
    },
    protocal: {
      type: String,
      default: 'hls'
    }
  },
  data() {
    return {
      player: null,
      url: undefined,
      options: {
        autoplay: false,
        controls: true,
        fill: true
      }
    };
  },
  watch: {},
  activated() {
    this.initPlay();
  },
  deactivated() {
    if (this.player) {
      this.player.dispose(); // 销毁
    }
  },
  mounted() {
    this.initPlay();
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose(); // 销毁
    }
  },
  methods: {
    initPlay() {
      this.player = videojs(this.$refs.videoPlayer, this.options, function onPlayerReady() {});
      this.player.language('zh-CN');
      // 重新初始化播放器进行播放
      if (this.videoId) {
        this.initVideo();
      }
    },
    async initVideo() {
      try {
        this.url = undefined;
        if (this.videoType === '2') {
          //  获取8700设备hls流
          const get8700HLS = '/deviceManagmentApi/video8700/getPreviewUrlById';
          const { resultData } = await this.$http.post(get8700HLS, { videoId: this.videoId, videoType: '2' });
          this.url = resultData;
        } else if (this.videoType === '3') {
          //  获取ISC视频设备hls流
          // const getISCHLS = '/deviceManagmentApi/videoISC/getHlsUrlByVideoNo/';
          let params={
            videoId:this.videoId,
            protocal:this.protocal
          }
          const { resultData } = await getHlsUrlByVideoNo(params);
          this.url = resultData;
        } else if (this.videoType === '6') {
          // 实时监控
          const getLiveGBSLive = '/videoPlayer/liveGBSGetStartUrlByVideoId';
          const { resultData } = await this.$http.post(getLiveGBSLive, { videoId: this.videoId });
          this.url = resultData.hlsUrl;
        }
        if (this.url) {
          this.player.src({ src: this.url, type: 'application/x-mpegURL' });
          this.player.play();
        }
      } catch (error) {
        this.url = undefined;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.play-video {
  width: 100%;
  height: 100%;
  .video-js {
    width: 100%;
    height: 100%;
  }
  .video-js .vjs-time-control {
    display: block;
  }
  .video-js .vjs-remaining-time {
    display: none;
  }
}
</style>
