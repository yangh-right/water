<template>
  <div class="point">
    <div class="card card0">
      <MudProduction
        cardTitle="二沉池出口污泥含固率"
        configCode="second_sink_pond_exit"
        :waterPlantId="waterPlantId"
      ></MudProduction>
    </div>
    <div class="card card1">
      <MudProduction
        cardTitle="储泥池污泥含固率"
        configCode="mud_storage_pond"
        :waterPlantId="waterPlantId"
      ></MudProduction>
    </div>
  </div>
</template>

<script>
import MudProduction from './MudProduction';
export default {
  components: { MudProduction },
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
