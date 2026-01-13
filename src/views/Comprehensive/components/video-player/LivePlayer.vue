<!--
 * @Author: wangyr
 * @Date: 2023-04-15 16:00:25
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-04-17 13:52:21
 * @Description:
-->
<template>
  <div class="videoWrapper">
    <LivePlayer :videoUrl="videoUrl" autoplay :stretch="false" v-loading="loading" element-loading-background="#000" :loading.sync="loading" :live="true"> </LivePlayer>
  </div>
</template>
<script>
import LivePlayer from '@liveqing/liveplayer';
export default {
  name: 'LivePlayerDemo',
  components: {
    LivePlayer
  },
  props: ['videoId'],
  data() {
    return {
      videoUrl: '',
      loading: false
    };
  },
  watch: {
    videoId() {
      this.getUrl();
    }
  },
  created() {
    this.getUrl();
  },
  activated() {
    this.getUrl();
  },
  deactivated() {
    this.stop();
  },
  beforeDestroy() {
    this.stop();
  },
  methods: {
    // async getUrl() {
    //   let url = '';
    //   this.loading = true;
    //   // 实时监控
    //   const getLiveGBSLive = '/videoPlayer/liveGBSGetStartUrlByVideoId';
    //   const { resultData } = await this.$http.post(getLiveGBSLive, { videoId: this.videoId });
    //   url = resultData?.wsFlvUrl;
    //   if (resultData?.videoId === this.videoId) {
    //     // 解决切换视频上次请求比最新请求慢的问题
    //     this.videoUrl = url;
    //   }
    //   this.loading = false;
    // },
    stop() {
      this.videoUrl = '';
    }
  }
};
</script>
<style lang="less" scoped>
.videoWrapper {
  width: 100%;
  height: 100%;
  /deep/ .player-wrapper {
    height: 100%;
    .video-wrapper {
      height: 100%;
      padding-bottom: 0 !important;
    }
  }
}
</style>
