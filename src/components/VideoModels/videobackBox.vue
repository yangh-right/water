<!--
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-04-26 18:26:49
 * @LastEditTime: 2022-04-28 19:51:48
 * @LastEditors: huhaiou
-->
<!--
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-02-25 15:16:39
 * @LastEditTime: 2022-04-08 16:29:05
 * @LastEditors: huhaiou
-->
<template>
  <div class="back-box">
    <template v-if="extColumn =='3'">
      <videoisc-back v-if="currentVideoCode"
        ref="iscVideoBack"
        :videoCode="currentVideoCode"
        :extColumn = "extColumn"
        :queryTime="queryTime"
        @getImg="saveImg"
      ></videoisc-back>
    </template>
    <template v-if="extColumn =='2'">
      <video8700-back v-if="currentVideoCode"
        ref="video8700Back"
        :videoCode="currentVideoCode"
        :queryTime="queryTime"
      ></video8700-back>
    </template>
    <template v-if="extColumn =='1'">
      <video9800-back v-if="currentVideoCode "
        ref="video9800Back"
        :videoCode="currentVideoCode"
        :queryTime="queryTime"
      ></video9800-back>
    </template>
    <template v-if="extColumn =='7'">
      <!-- imou 大华视频 playType 1为实时监控 2为视频回放 -->
      <imou-player v-if="currentVideoCode "
        :playerId="'liveImouPlayer'"
        :videoId="currentVideoCode"
        :queryTime="queryTime"
        :playType="'2'"
      />
    </template>
    <template v-if="!['1', '2', '3', '7'].includes(extColumn)">
      <!-- 流播放 todo 传queryTime回放 -->
      <video-flow
        :videoCode="currentVideoCode"
        :videType="extColumn"
        :playSite="setting.playSite"
        :queryTime="queryTime"
      ></video-flow>
    </template>
  </div>

</template>

<script>
  import videoiscBack from './videoiscBack';
  import video8700Back from './video8700Back';
  import video9800Back from './video9800Back';
  import ImouPlayer from '@/components/VideoModels/ImouPlayer';
  import VideoFlow from '@/components/VideoModels/videoFlow.vue';
  export default {
      name: 'VideoliveBox',
      components: { videoiscBack, video8700Back, video9800Back, ImouPlayer, VideoFlow },
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
          },
          queryTime: {
              type: Array,
              required: true,
              default: () => []
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
          this.$refs.iscVideoBack?.getCurrentView();
        },
        saveImg(_url, name) {
          this.$emit('getImg', _url, name);
        },
        handleResize(isFullScreen) {
          this.full = isFullScreen;
          this.$refs.iscVideoBack?.handleResize();
        }
      }
  };
</script>

<style scoped>
.back-box{
  height:100%;
  width: 100%;
}
</style>
