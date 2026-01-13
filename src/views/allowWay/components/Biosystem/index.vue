<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-07-05 13:20:41
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-10-08 16:23:53
 * @Description:
-->
<template>
  <div class="page">
    <div class="page-item">
      <quality-change
        :waterPlantId="waterPlantId"
        title="各级处理水质变化趋势"
        :showDate="true"
        modleType="cod"
      ></quality-change>
    </div>
    <div class="page-item">
      <Pollutant-Removal
          :waterPlantId="waterPlantId"
          title="污染物去除率"
          modleType="pollutant"
          :showDate="true"
      ></Pollutant-Removal>
    </div>
  </div>
</template>

<script>
import ContributeRate from './ContributeRate.vue';
import PollutantRemoval from './PollutantRemoval.vue';
import QualityChange from './QualityChange.vue';
import { codOptions } from '../data';
export default {
  name: 'Biosystem',
  components: {
    ContributeRate,
    QualityChange,
    PollutantRemoval
  },
  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      codOptions,
      layout: {
        span: 6,
        wrapperCol: { span: 18 },
        gutter: [0] //栅格间隔[水平间距，垂直间距]
      }
    };
  },
  computed: {},
  watch: {},
  methods: {
    factoryChange() {}
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.page {
  height: 100%;
  margin-top: 10px;
  .page-item {
    width: 100%;
    overflow: hidden;
    height: calc(50% - 6px);
    margin-bottom: 10px;
    &:nth-last-child(1) {
      margin-bottom: 0px;
    }
  }
}
</style>
