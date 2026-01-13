<template>
  <div class="point">
    <div class="card card0">
      <biochemicalPool
        cardTitle="生化池"
        :waterPlantId="waterPlantId"
        configCode="biocycle_pool"
      ></biochemicalPool>
    </div>
    <div class="card card1">
      <biochemicalSmart cardTitle="加药泵反馈" :waterPlantId="waterPlantId"></biochemicalSmart>
    </div>
  </div>
</template>

<script>
import biochemicalPool from './biochemicalPool';
import biochemicalSmart from './biochemicalSmart';
export default {
  components: { biochemicalPool, biochemicalSmart },
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
