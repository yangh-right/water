<template>
  <div class="point">
    <div class="card card0">
      <biochemicalPool
        cardTitle="生化池"
        :waterPlantId="waterPlantId"
        configCode="biocycle_pool_medicine"
      ></biochemicalPool>
    </div>
    <div class="card card1">
      <biochemicalPool
        cardTitle="反硝化滤池"
        :waterPlantId="waterPlantId"
        configCode="denitrification_filter"
      ></biochemicalPool>
    </div>
  </div>
</template>

<script>
import biochemicalPool from './biochemicalPool';
export default {
  components: { biochemicalPool },
  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  }
};
</script>
<style lang="less" scoped>
.point {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .card {
    height: 100%;
    width: calc(50% - 6px);
  }
}
</style>
