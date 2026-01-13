<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: fengtaotao
 * @LastEditTime: 2023-05-23 16:40:53
-->
<template>
  <div class="content">
    <div class="content-title">工艺流程图</div>
    <FactorySelect
      class="select"
      v-model.trim="waterPlantId"
      autoSelect
      @change="handleSearch"
    ></FactorySelect>
    <iframe
      :src="svgUrl"
      ref="contentFrame"
      title="工艺流程图"
      id="contentFrame"
      name="contentFrame"
      class="contentFrame"
    ></iframe>
  </div>
</template>
<script>
import { getOptimizationUrlMap } from '@/api/optimization';
export default {
  name: 'ProcessFlow',
  props: {},
  data() {
    return {
      svgUrl: '',
      waterPlantId: '',
      factoryList: []
    };
  },
  components: {
    FactorySelect: () => import('@/components/factory-select/index.vue')
  },
  created() {
    this.getFactoryList();
    this.getUrlMap();
  },
  methods: {
    handleSearch(val) {
      this.$emit('factorySelect', val);
    },
    async getFactoryList() {
      const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
      this.factoryList = resultData;
      this.$emit('factorySelect', this.factoryList[0].id);
    },
    async getUrlMap() {
      let { resultData, status } = await getOptimizationUrlMap();
      if (status === 'complete') {
        this.svgUrl = resultData;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  position: relative;
  margin: 6px;
  width: calc(50% - 6px);
  background-color: var(--supply-color-bg-card-component);
  &-title {
    height: 40px;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 16px;
    color: #333333;
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
}
</style>
