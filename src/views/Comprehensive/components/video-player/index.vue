<!--
 * @Author: wangyr
 * @Date: 2023-04-12 17:18:07
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-04-18 16:39:29
 * @Description:
-->
<template>
  <div class="video-player">
    <!--  videoType: 1:9800 2:8700 3:isc 6:liveGBS -->
    <VideoPlayer v-if="(protocal === 'hls' && videoType === '3') || videoType === '2'||videoType === '6'" :videoId="videoId" :videoType="videoType" :protocal="protocal"></VideoPlayer>
    <H5Back v-if="protocal === 'ws' && isChrome && videoType === '3'" :videoId="videoId" :protocal="protocal"></H5Back>
    <div v-if="!isChrome && videoType === '3'" class="file-item">
      <w-empty description="ISC设备流媒体播放仅支持Chrome80+" />
    </div>
    <!-- <VideoPlayer v-if="videoType === '6'" :videoId="videoId" /> -->
  </div>
</template>

<script>
import VideoPlayer from './VideoPlayer';
import H5Back from './H5Back.vue';
import {
getIsWS
} from '@/api/public';
// import LivePlayer from './LivePlayer.vue';
export default {
  name: 'video-player',
  components: { VideoPlayer, H5Back },
  props: {
    videoId: { type: String, default: '', require: true },
    videoType: {
      type: String,
      default: '3'
    }
  },
  data() {
    return {
      protocal: 'hls'
    };
  },
  computed: {
    isChrome() {
      return navigator.userAgent.toLowerCase().includes('chrome');
    }
  },
  watch: {},
  created() {
    this.getProtocal();
  },
  activated() {},
  methods: {
    async getProtocal() {
      let { resultData } = await getIsWS();
      this.protocal = resultData === '0' ? 'hls' : 'ws';
    }
  }
};
</script>

<style lang="less" scoped>
.video-player {
  width: 100%;
  height: 100%;
}
</style>
