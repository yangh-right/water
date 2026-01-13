<!--
 * @Author: wangyr
 * @Date: 2023-05-18 08:58:06
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-07-12 11:08:24
 * @Description:
-->
<!--
 * @Author: wangyr
 * @Date: 2023-05-18 08:58:06
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-05-18 17:17:55
 * @Description:
-->
<template>
  <div class="ourbim-app">
    <div class="bim-header">
      <div class="bim-title">城北污水厂数字孪生平台</div>
      <!-- 是否全屏展示 -->
      <div class="full-screen">
        <w-icon
          class="supply-mx-2 supply-cursor-pointer"
          :type="isFullScreen ? 'ic_resize_shrink' : 'ic_resize_enlarge'"
          @click="fullScreen"
        />
      </div>
      <div class="bim-tabs">
        <div
          v-for="tab in bimTabs"
          :key="tab.type"
          :class="[currentTab === tab.type ? 'bim-crrent' : '', 'bim-tab']"
          @click="changeTab(tab.type)"
        >
          {{ tab.name }}
        </div>
      </div>
    </div>

    <!-- 领导驾驶舱 -->
    <LeftCockpitContent v-if="currentTab === 'cockpit'" ref="leftCockpitContent" :taskId="taskId" />
    <RightCockpitContent
      v-if="currentTab === 'cockpit'"
      ref="rightCockpitContent"
      :taskId="taskId"
    />
    <!-- 巡检漫游 -->
    <LeftRoamContent
      v-if="currentTab === 'roam'"
      ref="rightRoamContent"
      :taskId="taskId"
      :appid="appid"
    />
    <iframe class="ht-view" ref="bim-view" title="视频监控" :src="iframeUrl" />
    <!-- 视频监控 -->
    <dialog-container title="视频监控" :visible.sync="showVideo">
      <isc-video
        v-if="playUrl"
        :playUrl="playUrl"
        :videoId="currentVideoId"
        :timeout="1 * 1000"
      ></isc-video>
    </dialog-container>
  </div>
</template>

<script>
import screenfull from 'screenfull';
import bimMixin from './mixins/bim-mixin';
// 领导驾驶舱
import LeftCockpitContent from './models/LeftCockpitContent.vue';
import RightCockpitContent from './models/RightCockpitContent.vue';
// 巡检漫游
import LeftRoamContent from './models/LeftRoamContent.vue';
import DialogContainer from './components/dialog-container';
import IscVideo from '@/components/IscVideo';
import { getAccessTokenApi } from '@/api/bim.js';
export default {
  name: 'Bim',
  components: {
    LeftCockpitContent,
    RightCockpitContent,
    LeftRoamContent,
    DialogContainer,
    IscVideo
  },
  mixins: [bimMixin],
  data() {
    return {
      isFullScreen: false,
      visible: false,
      dragableElement: null,
      originalStyle: {},
      currentTab: 'cockpit',
      bimTabs: [
        {
          name: '驾驶舱',
          type: 'cockpit'
        },
        {
          name: '巡检漫游',
          type: 'roam'
        },
        {
          name: '培训',
          type: 'train'
        }
      ],
      showVideo: false,
      currentVideoId: '',
      playUrl: null
    };
  },
  computed: {},
  watch: {},
  methods: {
    bimRenderCompleted() {
      this.complete = true;
      this.bimCompleted = true;
      if (this.pointId > 0) {
        // moveToViewPoint(this.pointId);
      }
    },
    changeTab(type) {
      this.currentTab = type;
    },
    /* 全屏切换 */
    fullScreen() {
      if (this.isFullScreen) {
        this.resetModal(this.dragableElement);
        screenfull.exit();
      } else {
        this.setFullSize(this.dragableElement);
        screenfull.request();
      }
    },
    /* 设置全屏 */
    setFullSize(dragableElement) {
      dragableElement.style.left = 0;
      dragableElement.style.top = 0;
      dragableElement.style.height = '100VH';
      dragableElement.style.width = '100VW';
      dragableElement.style.position = 'fixed';
      dragableElement.style.zIndex = 1000;
      dragableElement.style.backgroundColor = '#000';
      dragableElement.classList.add('full-app');
      this.isFullScreen = true;
    },
    /* 重置弹框大小 */
    resetModal(dragableElement) {
      if (!dragableElement) return false;
      dragableElement.style.height = this.originalStyle.height + 'px';
      dragableElement.style.width = this.originalStyle.width + 'px';
      dragableElement.style.top = this.originalStyle.top;
      dragableElement.style.left = this.originalStyle.left;
      dragableElement.style.position = 'relative';
      dragableElement.style.zIndex = 1;
      dragableElement.style.backgroundColor = 'transparent';
      dragableElement.classList.remove('full-app');
      this.isFullScreen = false;
    },
    initDragable() {
      this.dragableElement = document.querySelector('.ourbim-app');
      if (!this.dragableElement) return;
      // 初始非全屏
      this.isFullScreen =
        this.dragableElement.style.width === '100vw' &&
        this.dragableElement.style.height === '100vh';
      // 记录初始位置和宽高
      this.originalStyle = {
        top: this.dragableElement.style.top,
        left: this.dragableElement.style.left,
        width: this.dragableElement.clientWidth,
        height: this.dragableElement.clientHeight
      };
    },
    // 构件的点击事件回调函数
    async componentClick(data) {
      if (data.mN && data.mN === '0B3298B34F6CD6CC7E71DAA9F1E12E91') {
        //   let res = await this.$http.get(
        //     `/waterwork-sys-api/ConfigureItem/getPageConfigByElementId?waterPlantId=${this.waterPlantId}&elementId=${data.mN}`
        //   );
        //   if (res?.resultData?.type === 'device') {
        //     this.deviceId = res.resultData.id;
        //     this.showDevice = true;
        //   } else if (res?.resultData?.type === 'video') {
        //     // 获取视频信息
        //     let res1 = await this.$http.post(
        //       `/waterwork-device-api/MonitorStructure/queryByStationIdAndStructureName`,
        //       {
        //         stationId: this.waterPlantId,
        //         pageFlag: false,
        //         dsDeviceVideoQuery: {
        //           pageFlag: false,
        //           dsAreaStationDeviceQueries: [
        //             {
        //               stationId: [this.waterPlantId]
        //             }
        //           ],
        //           keyword: res.resultData.id
        //         }
        //       }
        //     );
        //     this.video.videoId = res1?.resultData[0]?.videoVO?.videoId;
        console.log('eeee');
        this.playUrl = 'ws://113.201.207.66:559/openUrl/qbb1MuQ';
        this.showVideo = true;
        //   }
      }
    }
  },
  created() {
    // this.initBim();
  },
  mounted() {
    setTimeout(() => {
      this.initDragable();
    }, 20);
  }
};
</script>

<style lang="less" scoped>
.ourbim-app {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  .full-screen {
    position: absolute;
    right: 166px;
    top: 100px;
  }
  .bim-header {
    width: 1150px;
    height: 80px;
    background: url('~@/assets/images/default/bim-title.png') no-repeat;
    background-size: 100% 100%;
    position: absolute;
    left: 50%;
    top: 0;
    margin-left: -575px;
    margin-top: -4px;

    .bim-title {
      line-height: 62px;
      font-family: YouSheBiaoTiHei, sans-serif;
      font-size: 26px;
      color: #ffffff;
      text-align: center;
      text-shadow: 0 0 12px #0070ffcc;
    }
    .bim-tabs {
      width: 100%;
      display: flex;
      justify-content: center;
      cursor: pointer;
      margin-top: 26px;

      .bim-tab {
        width: 132px;
        height: 43px;
        line-height: 38px;
        background: url('~@/assets/images/default/bim-tab.png') no-repeat;
        margin: 0 7px;
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 16px;
        color: #ecf4ffab;
        letter-spacing: 0;
        text-align: center;
      }
      .bim-crrent {
        background: url('~@/assets/images/default/bim-tab.png') no-repeat;
        color: #ecf4ff;
      }
    }
  }

  .ht-view {
    width: 100%;
    height: 100%;
  }
}

.full-app .cockpit-aside {
  height: 100% !important;
  margin: 12px 0;
  box-sizing: border-box;
}
</style>
