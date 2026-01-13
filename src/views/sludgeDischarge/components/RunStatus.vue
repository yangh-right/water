<!-- 运行状态组件 -->
<template>
  <div class="container">
    <!-- 标题 -->
    <div class="page-title">{{ title }}</div>
    <!-- 流程图展示区域 -->
    <div class="iframe-view">
      <!-- 二沉池流程图 -->
      <process-flow
        title="二沉池"
        :svgUrl="svgUrl1"
        :waterPlantId="waterPlantId"
        configCode="sludge_discharge_sedimentation"
      ></process-flow>
      <!-- 剩余污泥泵房流程图 -->
      <process-flow
        title="剩余污泥泵房"
        :svgUrl="svgUrl2"
        :waterPlantId="waterPlantId"
        configCode="sludge_discharge_excess_sludge"
      ></process-flow>
    </div>
  </div>
</template>

<script>
// 导入相关依赖
import { accessToken } from '@wpg/framework-vue';
import { getSvgListByCondition } from '@/api/optimization';
import ProcessFlow from './ProcessFlow.vue';

export default {
  name: 'RunStatus',
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
  components: {
    ProcessFlow
  },
  data() {
    return {
      // 二沉池流程图URL
      svgUrl1: '',
      // 剩余污泥泵房流程图URL
      svgUrl2: ''
    };
  },
  watch: {
    // 监听水厂ID变化
    waterPlantId() {
      this.getUrlMap();
    }
  },
  methods: {
    // 获取流程图URL
    async getUrlMap() {
      let { resultData, status } = await getSvgListByCondition({
        pageSize: 50,
        stationIds: [this.waterPlantId]
      });
      if (status === 'complete') {
        const token = accessToken.get();
        resultData.forEach(item => {
          if (item.templateName === '二沉池') {
            this.svgUrl1 = item.previewUrl + `&token=${token}&parent=${window.origin}`;
          }
          if (item.templateName === '剩余污泥泵池') {
            this.svgUrl2 = item.previewUrl + `&token=${token}&parent=${window.origin}`;
          }
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
/* 样式部分 */
.container {
  width: 100%;
  height: 274px;
  background: var(--supply-color-bg-card-DEFAULT);
  overflow: hidden;
  .page-title {
    height: 40px;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .iframe-view {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: calc(100% - 40px);
    background: var(--supply-color-bg-card-DEFAULT);
    overflow: hidden;
  }
}
</style>
