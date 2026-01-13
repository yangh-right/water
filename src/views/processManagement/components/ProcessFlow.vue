<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-12 17:13:32
-->
<template>
  <div class="content">
    <div v-if="!!svgSmallUrl" class="full-screen">
      <w-icon
        class="supply-mx-2 supply-cursor-pointer"
        :type="isFullScreen ? 'ic_resize_shrink' : 'ic_resize_enlarge'"
        @click="fullScreen"
      />
    </div>
    <div class="content-title">工艺流程-生物池</div>
    <w-spin :spinning="loading" class="spin">
      <iframe
        v-if="!!svgSmallUrl"
        :src="svgSmallUrl"
        title="组态"
        ref="contentFrame"
        id="contentFrame"
        name="contentFrame"
        class="contentFrame"
      ></iframe>
      <w-empty v-else class="empty" description="暂未配置"></w-empty>
    </w-spin>
    <!-- 放大图 -->
    <w-modal
      :visible="isFullScreen"
      :footeeleteDevicer="null"
      :footer="null"
      width="1080px"
      @cancel="isFullScreen = false"
    >
      <iframe :src="svgBigUrl" width="1000" height="600" title="组态" class="svgFrame"></iframe>
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
      loading: false,
      isFullScreen: false,
      svgSmallUrl: '',
      svgBigUrl: ''
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
      this.loading = true;
      let { resultData, status } = await getSvgListByCondition({
        stationIds: [this.waterPlantId],
        type: 'biocycle'
      });
      this.loading = false;
      if (status === 'complete' && resultData?.length > 0) {
        const token = accessToken.get();
        this.svgSmallUrl = resultData[0]?.previewUrl + `&token=${token}&parent=${window.origin}`;
        this.svgBigUrl = resultData[0]?.previewUrl + `&token=${token}&parent=${window.origin}`;
      } else {
        this.svgSmallUrl = '';
        this.svgBigUrl = '';
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
  width: calc(33.3% - 8px);
  // height: 432px;
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
  .spin {
    height: calc(100% - 64px);
    /deep/.wpg-spin-container {
      height: 100%;
    }
    .contentFrame {
      width: 100%;
      height: 232px;
      padding: 0 12px;
      margin: 10px 0;
      box-sizing: border-box;
    }
    .empty {
      height: 232px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
