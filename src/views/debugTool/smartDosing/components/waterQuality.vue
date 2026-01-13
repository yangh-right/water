<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-17 10:05:05
 * @Description: 
-->
<template>
  <card-box title="水质现状">
    <div class="card-item">
      <in-water v-bind="$attrs"></in-water>
    </div>
    <div class="card-item">
      <process-water-quality v-bind="$attrs"></process-water-quality>
    </div>
    <div class="card-item">
      <out-water v-bind="$attrs"></out-water>
    </div>
  </card-box>
</template>

<script>
import inWater from './inWater';
import outWater from './outWater';
import processWaterQuality from './processWaterQuality';
import CardBox from '@/components/CardBox';
export default {
  data() {
    return {};
  },

  components: { CardBox, inWater, outWater, processWaterQuality }
};
</script>
<style lang="less" scoped>
/deep/ .card-box__content {
  padding-top: 8px;
}
.card-item {
  height: 33.3%;
  /deep/.title {
    margin-top: 0px;
  }
}
</style>
