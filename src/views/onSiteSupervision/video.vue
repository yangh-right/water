<template>
  <div class="video_box">
    <video v-if="item" ref="videoPlayer" class="video-js">
      <source
        :src="item.videoUrl"
        type="video/mp4"
      />
    </video>
  </div>
</template>

<script>
import videojs from 'video.js';
import video_zhCN from 'video.js/dist/lang/zh-CN.json';
import 'videojs-contrib-hls';
videojs.addLanguage('zh-CN', video_zhCN);
export default {
  name: "VideoPlayer",
    props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      player: null
    };
  },
  mounted() {
    // 播放参数
    let options = {
      controls: true, // 是否显示底部控制栏
      preload: "auto", // 加载<video>标签后是否加载视频
      autoplay: "muted", // 静音播放
      // playbackRates: [0.5, 1, 1.5, 2],// 倍速播放
      width: "640",
      height: "247",
      controlBar: {
        // 自定义按钮的位置
        children: [
          {
            name: "playToggle"
          },
          {
            name: "progressControl"
          },
          {
            name: "currentTimeDisplay"
          },
          {
            name: "timeDivider"
          },
          {
            name: "durationDisplay"
          },

          {
            name: "volumePanel", // 音量调整方式横线条变为竖线条
            inline: false
          },
          {
            name: "pictureInPictureToggle" //画中画播放模式
          },
          {
            name: "fullscreenToggle"
          }
        ]
      }
    };
    this.player = videojs(this.$refs.videoPlayer, options,function onPlayerReady() {
      console.log('onPlayerReady', this);
    });
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose()
    }
  },
  methods: {
  }
};
</script>

<style scoped>
.video_box {
  margin: 10px;
  width: 99%;
  height: 450px;
}
.video-js {
  width: 100%;
  height: 450px;
}
</style>
