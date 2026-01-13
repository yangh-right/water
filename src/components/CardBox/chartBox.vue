<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-10 15:37:20
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-31 09:20:26
 * @Description:
-->
<template>
  <div class="card-chart">
    <line-chart
      v-if="!isEmpty"
      :option="option"
      v-bind="$attrs"
      @zrClick="myChartClick"
    ></line-chart>
    <w-empty class="empty" v-else></w-empty>
  </div>
</template>

<script>
import cardEmpty from './cardEmpty';
export default {
  name: 'cardChart',
  props: {
    option: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue'),
    cardEmpty
  },
  data() {
    return {
      isEmpty: false
    };
  },
  methods: {
    myChartClick(xDataItem, yDataItem) {
      this.$emit('myChartClick', xDataItem, yDataItem);
    }
  }
};
</script>
<style lang="less" scoped>
.card-chart {
  width: 100%;
  height: 100%;
  position: relative;
  .empty {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
