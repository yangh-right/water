<!-- 工艺流程图组件 -->
<template>
  <div class="content">
    <!-- 标题 -->
    <div class="content-title">{{ title }}</div>
    <!-- 加载状态 -->
    <w-spin :spinning="loading" class="spin">
      <!-- 流程图iframe -->
      <iframe
        v-if="!!svgUrl"
        :src="svgUrl"
        title="组态图"
        ref="contentFrame"
        id="contentFrame"
        name="contentFrame"
        class="contentFrame"
      ></iframe>
      <!-- 空状态 -->
      <w-empty v-else class="empty" description="暂未配置"></w-empty>
    </w-spin>
    <!-- 全屏弹窗 -->
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
// 导入相关依赖
import { accessToken } from '@wpg/framework-vue';
import { getSvgListByCondition } from '@/api/optimization';

export default {
  name: 'TechnologyFlow',
  props: {
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 水厂ID
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 是否全屏
      isFullScreen: false,
      // 流程图URL
      svgUrl: ''
    };
  },
  watch: {
    // 监听水厂ID变化
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getUrlMap();
        }
      },
      immediate: true
    }
  },
  methods: {
    // 获取流程图URL
    async getUrlMap() {
      this.loading = true;
      let { resultData, status } = await getSvgListByCondition({
        pageSize: 50,
        stationIds: [this.waterPlantId]
      });
      this.loading = false;
      if (status === 'complete') {
        const token = accessToken.get();
        resultData.forEach(item => {
          if (item.templateName === '储泥工艺流程图') {
            this.svgUrl = item.previewUrl + `&token=${token}&parent=${window.origin}`;
          }
        });
      }
    },
    // 全屏切换
    fullScreen() {
      this.isFullScreen = true;
    }
  }
};
</script>

<style lang="less" scoped>
/* 样式部分 */
.content {
  position: relative;
  width: 100%;
  height: 100%;
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
