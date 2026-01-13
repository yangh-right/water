<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:20:59
 * @LastEditors: fengtaotao
 * @LastEditTime: 2023-05-31 19:59:04
-->
<template>
  <div class="page">
    <!-- 加载中 -->
    <w-spin v-if="loading" />
    <!-- 工艺流程图 -->
    <div class="page-item">
      <process-flow @factorySelect="factorySelect"></process-flow>
      <in-water-data title="进水数据" :waterPlantId="waterPlantId"></in-water-data>
      <out-water-data title="出水数据" :waterPlantId="waterPlantId"></out-water-data>
    </div>
    <div class="page-item">
      <!-- 运行条件 -->
      <run-condition :waterPlantId="waterPlantId"></run-condition>
      <mlss-data title="MLSS" :waterPlantId="waterPlantId"></mlss-data>
      <water-temp title="DO/水温" :waterPlantId="waterPlantId"></water-temp>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Optimization',
  components: {
    ProcessFlow: () => import('./components/ProcessFlow'),
    RunCondition: () => import('./components/RunCondition'),
    InWaterData: () => import('./components/InWaterData'),
    OutWaterData: () => import('./components/OutWaterData'),
    WaterTemp: () => import('./components/WaterTemp'),
    MlssData: () => import('./components/MlssData'),
  },
  mixins: [],
  data() {
    return {
      key: null,
      loading: false,
      draggable: false,
      isFull: false,
      factoryId: '',
      waterPlantId: '',
      modules: [],
    };
  },
  activated() {},
  methods: {
    factorySelect(val) {
      this.waterPlantId = val;
    },
    handleSearch(val) {
      this.waterPlantId = val;
    },
    handleFull() {
      this.isFull = !this.isFull;
    },
    handleChange(id) {
      this.factoryId = id;
    },
  },
};
</script>

<style lang="less" scoped>
.page {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
}
.page-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 50%;
}
</style>
