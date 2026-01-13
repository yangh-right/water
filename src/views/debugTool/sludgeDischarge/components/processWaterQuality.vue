<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-13 13:17:19
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
import { genProcessWaterQualityOption } from './data';
export default {
  props: {
    placePoints: {
      type: Array,
      default: () => []
    },
    pointCode: { type: String, default: '1' },
    sludgeConcentrationData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      placeId: '',
      pointList: [
        { label: '月', value: '1' },
        { label: '日', value: '2' }
      ],
      option: genProcessWaterQualityOption()
    };
  },
  components: { LineChart: () => import('@/components/CardBox/chartBox.vue') },
  watch: {
    placePoints: {
      handler() {
        if (this.placePoints.length > 0) {
          this.placeId = this.placePoints[0].id;
        }
      },
      iimmediate: true,
      deep: true
    },
    sludgeConcentrationData: {
      handler() {
        if (Object.keys(this.sludgeConcentrationData).length > 0) {
          this.handleChartData();
        }
      },
      iimmediate: true,
      deep: true
    }
  },
  methods: {
    handleChartData() {
      let xData = this.sludgeConcentrationData.timeDataList?.map(data =>
        this.pointCode === '1' ? data.dateTimeStr.slice(0, 11) : data.dateTimeStr
      );
      let yData = this.sludgeConcentrationData.timeDataList?.map(data => data.historyPointValue);
      let option = genProcessWaterQualityOption({
        xData,
        yData,
        xAxisRotate: 40,
        xAxisLabelFormat: value => {
          return value && value.length > 10
            ? this.pointCode === '1'
              ? value?.slice(5, 10)
              : value?.slice(11, 16)
            : value;
        },
        yAxisName: this.sludgeConcentrationData.pointUnit ?? ' m³'
      });
      this.option = option || {};
    },
    handlePointRateCode(e) {
      this.$emit('handlesludgeConcentration', e.target.value);
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
