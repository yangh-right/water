<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-08-31 18:17:44
-->
<template>
  <div class="content">
    <div v-if="!!svgUrl" class="full-screen">
      <w-icon
        class="supply-mx-2 supply-cursor-pointer"
        :type="isFullScreen ? 'ic_resize_shrink' : 'ic_resize_enlarge'"
        @click="fullScreen"
      />
    </div>
    <div class="content-title">{{ title }}</div>
    <div class="iframe-img">
      <!-- <img src="@/assets/images/default/water_plant.jpg" style="width: 100%;height: 100%" /> -->
      <iframe
        v-if="!!svgUrl"
        :src="svgUrl"
        title="组态图"
        ref="contentFrame"
        id="contentFrame"
        name="contentFrame"
        class="contentFrame"
      ></iframe>
      <w-empty v-else class="empty" description="暂未配置"></w-empty>
    </div>
    <div class="point-list">
      <div v-for="item in pointsList" :key="item.pointMemo" class="carbon-list">
        <span class="point-name">{{ item.pointMemo }}</span>
        <div class="point-box">
          <span class="value">{{ item.pointValue }}</span>
          <span class="unit">{{ item.pointUnit }}</span>
        </div>
      </div>
    </div>
    <!-- 放大图 -->
    <w-modal
      :visible="isFullScreen"
      :footeeleteDevicer="null"
      :footer="null"
      width="1080px"
      @cancel="isFullScreen = false"
    >
      <!-- <img src="@/assets/images/default/water_plant.jpg" style="width: 100%;height: 100%" /> -->
      <iframe :src="svgUrl" width="1000" height="600" title="组态图" class="svgFrame"></iframe>
    </w-modal>
  </div>
</template>
<script>
import { getRealDataByPointConfigCode } from '@/api/optimization';

export default {
  name: 'ProcessFlow',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    configCode: {
      type: String,
      default: ''
    },
    svgUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isFullScreen: false,
      pointsList: []
    };
  },
  components: {},
  watch: {
    waterPlantId: {
      immediate: true,
      handler() {
        this.getUrlMap();
      }
    }
  },
  created() {},
  methods: {
    async getUrlMap() {
      let params = {
        configCode: this.configCode,
        pumpHouseId: this.waterPlantId
      };
      let { resultData, status } = await getRealDataByPointConfigCode(params);
      console.log(this.configCode, resultData);
      if (status === 'complete') {
        this.pointsList = resultData;
      }
    },
    /* 全屏切换 */
    fullScreen() {
      this.isFullScreen = true;
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  position: relative;
  width: calc(50% - 8px);
  height: 100%;
  .full-screen {
    position: absolute;
    right: 16px;
    top: 2px;
  }
  &-title {
    height: 32px;
    padding: 0 12px 8px 12px;
    font-weight: 400;
    font-size: 14px;
    color: var(--supply-color-secondary);
    letter-spacing: 0;
  }
  .iframe-img {
    height: 150px;
    padding: 0 12px;
    box-sizing: border-box;
  }
  .select {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 120px;
  }
  .contentFrame {
    width: 100%;
    height: 100%;
    padding: 6px;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .point-list {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 8px;
    box-sizing: border-box;
    .carbon-list {
      width: calc(50% - 8px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 30px;
      font-weight: 400;
      font-size: 14px;
      color: #333333;
      .point-name {
        width: 200px;
      }
      .point-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .unit {
        margin-left: 10px;
        width: 40px;
      }
      .value {
        display: flex;
        margin-left: 40px;
        padding: 0 15px;
        text-align: left;
        box-sizing: border-box;
        width: 88px;
        height: 28px;
        line-height: 28px;
        background: #f3f6f8;
        border: 1px solid #e9e8e8;
        color: var(--supply-color-secondary);
        border-radius: 4px;
      }
      /deep/ .list__input {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 88px;
        height: 28px;
        line-height: 28px;
        padding: 0 4px;
        box-sizing: border-box;
        background: #f3f6f8;
        border: 1px solid #e9e8e8;
        color: var(--supply-color-secondary);
        .wpg-input-number-handler-up,
        .wpg-input-number-handler-down {
          visibility: hidden;
        }
        .wpg-input-number-input-wrap input {
          height: 28px;
        }
      }
    }
  }
}
</style>
