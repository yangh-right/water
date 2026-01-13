<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: wangyr
 * @LastEditTime: 2024-12-04 16:30:41
 * @Description:
-->
<template>
  <div class="supply-h-full">
    <w-radio-group class="circle-radio" v-model="pointCode" @change="handlePointRateCode">
      <w-radio-button v-for="item in pointList" :key="item.value" :value="item.value">
        {{ item.label }}
      </w-radio-button>
    </w-radio-group>
    <div class="chart-wrapper">
      <line-chart :option="option"></line-chart>
    </div>
  </div>
</template>

<script>
import { suggestPredictOption } from './data';
export default {
  props: {
    placePoints: {
      type: Array,
      default: () => []
    },
    timeCode: {
      type: String,
      default: '1'
    },
    sludgeFlowData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      placeId: '',
      pointCode: 'modelPointValue',
      pointList: [
        { label: '排泥流量', value: 'modelPointValue' },
        { label: '排泥量', value: 'historyPointValue' },
        { label: '干泥量', value: 'drySludgePv' },
        { label: '湿泥量', value: 'wetSludgePv' }
      ],
      option: suggestPredictOption()
    };
  },
  components: { LineChart: () => import('@/components/CardBox/chartBox.vue') },
  watch: {
    sludgeFlowData: {
      handler() {
        if (Object.keys(this.sludgeFlowData).length > 0) {
          this.handleChartData();
        }
      },
      iimmediate: true,
      deep: true
    }
  },
  methods: {
    handleChartData() {
      let xData = this.sludgeFlowData.timeDataList?.map(data =>
        this.timeCode === '1' ? data.dateTimeStr.slice(0, 11) : data.dateTimeStr
      );
      let yData1 = this.sludgeFlowData.timeDataList?.map(data => data[this.pointCode]);
      let option = suggestPredictOption({
        xData,
        yData1,
        xAxisRotate: 40,
        xAxisLabelFormat: value => {
          return value && value.length > 10
            ? this.timeCode === '1'
              ? value?.slice(5, 10)
              : value?.slice(11, 16)
            : value;
        },
        yAxisName: this.sludgeFlowData.pointUnit ?? 'm³'
      });
      // 无数据状态下y轴展示改善
      let isNoData = option.series.some(v => v.data.length > 0);
      if (!isNoData) {
        option.grid[0].left = '32px';
      }
      this.option = option || {};
    },
    handlePointRateCode(e) {
      this.handleChartData();
    }
  }
};
</script>
<style lang="less" scoped>
@import '@/views/debugTool/style/design.less';

.supply-h-full {
  height: 100%;
  padding: 6px 0;
  box-sizing: border-box;
}
.chart-wrapper {
  height: calc(100% - 30px);
}
</style>
