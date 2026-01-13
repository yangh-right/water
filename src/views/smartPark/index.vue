<!--
 * @Author: wangyr
 * @Date: 2023-05-18 08:58:06
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-28 11:10:22
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
    <!-- 领导驾驶舱 -->
    <LeftCockpitContent v-if="currentTab === 'cockpit'" ref="leftCockpitContent" :taskId="taskId" />
    <RightCockpitContent
      v-if="currentTab === 'cockpit'"
      ref="rightCockpitContent"
      :taskId="taskId"
    />
    <!-- 巡检漫游 -->
    <LeftRoamContent v-if="currentTab === 'roam'" ref="rightRoamContent" :taskId="taskId" />
    <Introduce v-if="currentTab === 'introduce'" ref="introduce" :taskId="taskId" @close="close" />
    <iframe class="ht-view" ref="bim-view" title="bim组态" :src="iframeUrl" />
  </div>
</template>

<script>
import screenfull from 'screenfull';
import bimMixin from './mixins/bim-mixin';
// 领导驾驶舱
import LeftCockpitContent from './models/LeftCockpitContent.vue';
import RightCockpitContent from './models/RightCockpitContent.vue';
// 巡检漫游
import LeftRoamContent from '../bim/models/LeftRoamContent.vue';
import Introduce from './models/Introduce.vue';
import { getAccessTokenApi } from '@/api/bim.js';
export default {
  name: 'Bim',
  components: {
    LeftCockpitContent,
    RightCockpitContent,
    Introduce,
    LeftRoamContent
  },
  mixins: [bimMixin],
  data() {
    return {
      isFullScreen: false,
      currentTab: 'cockpit',
      bimTabs: [
        {
          name: '综合态势',
          type: 'cockpit'
        },
        {
          name: '园区介绍',
          type: 'introduce'
        },
        {
          name: '智能安防',
          type: 'security'
        },
        {
          name: '园区漫游',
          type: 'roam'
        }
      ]
    };
  },
  computed: {},
  watch: {},
  methods: {
    close() {
      this.currentTab = 'cockpit';
    },
    bimRenderCompleted() {
      this.complete = true;
      this.bimCompleted = true;
      if (this.pointId > 0) {
        // moveToViewPoint(this.pointId);
      }
    },
    changeTab(type) {
      this.currentTab = type;
      console.log(type);
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
    }
  },
  created() {},
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
  }
  .bim-tabs {
    position: absolute;
    width: 100%;
    display: flex;
    justify-content: center;
    cursor: pointer;
    bottom: 30px;

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
