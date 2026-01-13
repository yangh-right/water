<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-12 17:18:17
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
    <div class="content-title">工艺流程图</div>
    <w-spin :spinning="loading" class="spin">
      <iframe
        v-if="!!svgUrl"
        :src="svgUrl"
        ref="contentFrame"
        title="工艺流程图"
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
      <iframe :src="svgUrl" width="1000" height="600" title="图片放大" class="svgFrame"></iframe>
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
      currentParams: '',
      tabs: [
        {
          pointMemo: 'DO',
          pointName: 'jsc_cod'
        },
        {
          pointMemo: 'NH3-N',
          pointName: 'jsc_bod'
        },
        {
          pointMemo: 'NO3-N',
          pointName: 'jsc_a'
        },
        {
          pointMemo: 'PO4-P',
          pointName: 'jsc_b'
        },
        {
          pointMemo: 'MLSS',
          pointName: 'jsc_d'
        }
      ],
      loading: false,
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
      this.loading = true;
      let { resultData, status } = await getSvgListByCondition({
        stationIds: [this.waterPlantId],
        type: 'biochemical_pool'
      });
      this.loading = false;
      if (status === 'complete' && resultData?.length > 0) {
        const token = accessToken.get();
        this.svgUrl = resultData[0]?.previewUrl + `&token=${token}&parent=${window.origin}`;
      } else {
        this.svgUrl = '';
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
  width: calc(50% - 5px);
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  .full-screen {
    position: absolute;
    right: 16px;
    top: 16px;
  }
  &-title {
    height: 40px;
    padding: 4px 12px;
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .tabs {
    width: calc(100% - 20px);
    margin: 0 auto;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
    flex-wrap: wrap;
    cursor: pointer;
    overflow: hidden;
    .tab {
      flex-shrink: 0;
      padding: 0 15px;
      background: #f4f6f8;
      color: #666666;
      border-radius: 12px;
      font-size: 14px;
      margin-bottom: 2px;
    }
    .active {
      color: #5b8ff9;
      background: #5b8ff91a;
    }
  }
  .select {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 120px;
  }
  .spin {
    height: calc(100% - 64px);
    flex: 1 1 auto;

    /deep/.wpg-spin-container {
      height: 100%;
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
  }
}
</style>
