<!--
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-02-25 15:16:39
 * @LastEditTime: 2022-06-09 15:39:44
 * @LastEditors: yuan wenyu
-->
<template>
  <div class="live-box">
    <template v-if="extColumn =='3'">
      <videoisc-live v-if="currentVideoCode"
      ref="iscVideoLive"
        :showToolbar="showToolbar"
        :videoBoxId = "'liveBox'"
        :videoCode="currentVideoCode"
        :playSite="setting.playSite"
        :extColumn = "extColumn"
        :layout = "'1x1'"
        @getImg="saveImg"
        :full="full"
      ></videoisc-live>
    </template>

    <template v-if="extColumn =='7'">
      <!-- imou 大华视频 playType 1为实时监控 -->
      <imou-player v-if="currentVideoCode "
        :playerId="'liveImouPlayer'"
        :videoId="currentVideoCode"
        :playType="'1'"
      />
    </template>
    <template v-if="!['3', '7'].includes(extColumn)">
      <!-- 流播放 -->
      <video-flow
        :videoCode="currentVideoCode"
        :videType="extColumn"
        :playSite="setting.playSite"
      ></video-flow>
    </template>
  </div>

</template>

<script>
  import videoiscLive from './videoiscLive';
  import videoFlow from '@/components/VideoModels/videoFlow';
  import ImouPlayer from '@/components/VideoModels/ImouPlayer';
  export default {
      name: 'VideoliveBox',
      components: { videoiscLive, ImouPlayer, videoFlow },
      props: {
          currentVideoCode: {
              type: String,
              default: ''
          },
          extColumn: {
              type: String,
              default: ''
          },
          showToolbar: {
              type: Number,
              default: 1
          }
      },
      data() {
          return {
              setting: {
                  playSite: '1',  // 1手动播放 2循环播放
              },
              full: false,
          };
      },
      methods: {
        getCurrentView() {
          if (this.$refs.iscVideoLive) {
            this.$refs.iscVideoLive.getCurrentView()
            return true
          }else {
            return false
          }
        },
        saveImg(_url, name) {
          this.$emit('getImg', _url, name);
        },
        handleResize(isFullScreen) {
          this.full = isFullScreen;
          this.$refs.iscVideoLive?.handleResize();
        }
      }
  };
</script>

<style scoped>
.live-box{
  height:100%;
  width: 100%;
}
</style>
