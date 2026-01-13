<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-08-31 18:01:00
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
    <div class="content-title">泵站污水厂拓扑图</div>
    <iframe
      v-if="!!svgUrl"
      :src="svgUrl"
      ref="contentFrame"
      title="组态图"
      id="contentFrame"
      name="contentFrame"
      class="contentFrame"
    ></iframe>
    <w-empty v-else class="empty" description="暂未配置"></w-empty>
    <!-- 放大图 -->
    <w-modal
      :visible="isFullScreen"
      :footeeleteDevicer="null"
      :footer="null"
      width="1080px"
      @cancel="isFullScreen = false"
    >
      <iframe :src="svgUrl" width="1000" height="600" title="组态图" class="svgFrame"></iframe>
    </w-modal>
  </div>
</template>
<script>
import { accessToken } from '@wpg/framework-vue';
import { getSvgListByCondition } from '@/api/optimization';
export default {
  name: 'ProcessFlow',
  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isFullScreen: false,
      svgUrl: ''
    };
  },
  components: {},
  watch: {
    waterPlantId() {
      this.getUrlMap();
    }
  },
  created() {},
  methods: {
    async getUrlMap() {
      let { resultData, status } = await getSvgListByCondition({
        pageSize: 50,
        stationIds: [this.waterPlantId]
      });
      if (status === 'complete') {
        const token = accessToken.get();
        resultData.forEach(item => {
          if (item.templateName === '预测预警') {
            this.svgUrl = item.previewUrl + `&token=${token}&parent=${window.origin}`;
          }
        });
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
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  .full-screen {
    position: absolute;
    right: 16px;
    top: 16px;
  }
  &-title {
    height: 40px;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .select {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 120px;
  }
  .contentFrame {
    width: 100%;
    height: calc(100% - 40px);
    padding: 6px;
  }
  .empty {
    height: calc(100% - 40px);
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
